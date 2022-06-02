// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TrendivisionGacha is ERC721, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCount;
    Counters.Counter private _gachaIdCount;
    Counters.Counter private _breedIdCount;
    string private _baseTokenURI;
    IERC20 public immutable trend;
    constructor(address trendAddress_) ERC721("Trendivision","TDV") {
        trend = IERC20(trendAddress_);
         _gachaIdCount.increment();
         /// khi thực tế, cần các hàm thêm sửa xóa cho onlyOwner, do code study nên khai báo constructor
        _idToGacha[_gachaIdCount.current()] = Gacha(100 * 10**18, [60, 40, 0]);
        _gachaIdCount.increment();
        _idToGacha[_gachaIdCount.current()] = Gacha(200 * 10**18, [30, 50, 20]);
        _gachaIdCount.increment();
        _idToGacha[_gachaIdCount.current()] = Gacha(300 * 10**18, [10, 40, 50]);
        _gachaIdCount.increment();
        //for testing breed
        _idToGacha[_gachaIdCount.current()] = Gacha(100 * 10**18, [100, 0, 0]);
        _gachaIdCount.increment();
        _idToGacha[_gachaIdCount.current()] = Gacha(100 * 10**18, [0, 100, 0]);
        _gachaIdCount.increment();
        _idToGacha[_gachaIdCount.current()] = Gacha(100 * 10**18, [0, 0, 100]);
        //rank
        _rankToBreedTime[1] = 1 days;
        _rankToBreedTime[2] = 2 days;
        _rankToBreedTime[3] = 3 days;
    }

    struct BreedInfo {
        uint256 startTime;
        uint256 breedTime;
        address owner;
        uint256 matron; //con cai
        uint256 sire; //con duc
        uint8 newRank;
    }
    struct Gacha {
        uint256 price;
        uint8[3] rankRate;
    }
    struct Trendivision {
        uint8 rank;
        uint8 stat;
    }
    uint8[3] public ranks = [1,2,3];

    //should be privte
    mapping(uint256 => Gacha) public _idToGacha;
    mapping(uint256 => Trendivision) public _tokenIdToTrendivision;
    mapping(uint256 => BreedInfo) public _idToBreedInfo;
    mapping(uint8 => uint256) public _rankToBreedTime; //thực tế nên tạo 1 struct chứa rank và breedtime

    /*
     * Mở gacha mới tỷ lệ rank được định sẵn
     * @param gachaId_ gói gacha chọn mở
     * @param price_ giá của gói gacha, mục đích để khi giá gacha thay đổi thì hàm bị revert
     */
    function openGacha(uint8 gachaId_, uint256 price_) public returns(uint256) {
        require(_idToGacha[gachaId_].price >0, "TrendivisionGacha: invalid gacha");
        require(
            price_ == _idToGacha[gachaId_].price, "TrendivisionGacha: price not match");

            trend.transferFrom(_msgSender(),address(this),price_);
            _tokenIdCount.increment();
            uint256 _tokenId = _tokenIdCount.current();
            uint8 _rank = _generateRandomRankWithRatio(ranks, _idToGacha[gachaId_].rankRate);
            _mint(_msgSender(),_tokenId);
            _tokenIdToTrendivision[_tokenId] = Trendivision(_rank,0);
            return _tokenId;
    }

     /** Practice - suggestion:
     * update hàm breed để hàm không mint Petty ngay lập tức
     * Các thông tin của lượt breed được lưu lại với một Id để User có thể claim khi breed time kết thúc
     * Gợi ý: Lưu breed dưới dạng mapping(tokenId => Struct)
     * thực tế cần emit event, hiện tại code study nên không cần
     */
    function breedPetties(uint256 tokenId1_, uint256 tokenId2_) public {
        require(
            ownerOf(tokenId1_) == _msgSender(),
            "TrendivisionGacha: sender is not owner of token"
        );
        require(
            (getApproved(tokenId1_) == address(this) &&
                getApproved(tokenId2_) == address(this)) ||
                isApprovedForAll(_msgSender(), address(this)),
            "TrendivisionGacha: The contract is unauthorized to manage this token"
        );
        uint8 _rank = _tokenIdToTrendivision[tokenId1_].rank;
        require(
            _rank == _tokenIdToTrendivision[tokenId2_].rank,
            "TrendivisionGacha: must same rank"
        );
        require(_rank < 3, "TrendivisionGacha: petties is at the highest rank");
        uint8 _newRank = _rank + 1;
        _burn(tokenId1_);
        _burn(tokenId2_);
        delete _tokenIdToTrendivision[tokenId1_];
        delete _tokenIdToTrendivision[tokenId2_];

        _breedIdCount.increment();
        uint256 _breedId = _breedIdCount.current();
        _idToBreedInfo[_breedId] = BreedInfo(
            block.timestamp,
            _rankToBreedTime[_rank],
            _msgSender(),
            tokenId1_,
            tokenId2_,
            _newRank
        );

        // _tokenIdCount.increment();
        // uint256 _newTokenId = _tokenIdCount.current();
        // _mint(_msgSender(), _newTokenId);
        // _tokenIdToTrendivision[_newTokenId] = Trendivision(_newRank, 0);
    }

    /* Practice - suggestion:
     * Hàm claimsBreedPetty phục vụ việc claim một Petty sau quá trình breed
     * Hàm sẽ check user có đủ quyền để claim không và check Petty đã sẵn sàng để claim chưa.
     * Sau khi check user đã sẵn sàng claim, thực hiện mint nft mới cho user với rank++
     * Cần đảm bảo mỗi breedId chỉ được claim 1 lần
     * thực tế cần emit event, hiện tại code study nên không cần
     */
    function claimsPetty(uint256 breedId_) public {
        BreedInfo memory _breedInfo = _idToBreedInfo[breedId_];
        require(
            _breedInfo.owner == _msgSender(),
            "TrendivisionGacha: sender is not breed owner"
        );
        require(
            _breedInfo.startTime + _breedInfo.breedTime < block.timestamp,
            "TrendivisionGacha: breed time hasn't been exceeded"
        );
        delete _idToBreedInfo[breedId_];
        _tokenIdCount.increment();
        uint256 _newTokenId = _tokenIdCount.current();
        _mint(_msgSender(), _newTokenId);
        _tokenIdToTrendivision[_newTokenId] = Trendivision(_breedInfo.newRank, 0);
    }

   /*
     * @dev Lấy ngẫy nhiên một rank từ array rank truyền vào theo tỉ lệ nhất định
     * @param rankRate_ array bao gồm các ranks
     * @param ratios_ tỉ lệ tương ứng random ra các rank
     */
    function _generateRandomRankWithRatio(
        uint8[3] memory ranks_,
        uint8[3] memory ratios_ //[60, 40, 0]
    ) public view returns (uint8) {
        uint256 rand = _randInRange(1, 100);
        uint16 flag = 0;
        for (uint8 i = 0; i < ranks_.length; i++) {
            if (rand <= ratios_[i] + flag && rand >= flag) {
                return ranks_[i];
            }
            flag = flag + ratios_[i];
        }
        return 0;
    }

    /**
     * @dev Random trong khoảng min đến max
     */
    function _randInRange(uint256 min, uint256 max)
        public
        view
        returns (uint256)
    {
        uint256 num = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.difficulty, msg.sender)
            )
        ) % (max + 1 - min);
        return num + min;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function updateBaseTokenURI(string memory baseTokenURI_) public onlyOwner {
        _baseTokenURI = baseTokenURI_;
    }
}