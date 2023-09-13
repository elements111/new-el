import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import avatar from "../../assets/avatar.gif";
import Router from "next/router";
import { motion, AnimatePresence } from "framer-motion";

import Image from "next/image";
import { ethers } from "ethers";
import { ContractAbi, ContractAddress } from "../utils/constants";
import { fetchListings, fetCollection } from "../utils/utils";
import SuccessfulBidModal from "../Listing/SuccessfulBidModal";
import CollectionListingCard from "./CollectionListingCard";
import CollPlaceBidModal from "./CollPlaceBidModal";
import CollEnlargeNFTModal from "./CollEnlargeNFTModal";
import NFTCard from "../NFTCard";
import { useEthersSigner } from "../utils/getSigner";
import NFTCardSkeleton from "../LoadingSkeletons/NFTCardSkeleton";

type Props = {
  listing: any;
};

const CollectionListing = ({ user, users }: any) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalOpenEnlargeNFT, setModalOpenEnlargeNFT] =
    useState<boolean>(false);
  const [bidAmount, setBidAmount] = useState<string>("");
  // Hooks to detect user is on the right network and switch them if they are not
  const [loadingBid, setLoadingBid] = useState<boolean>(false);
  const [successfulBidmodalOpen, setSuccessfulBidModal] =
    useState<boolean>(false);
  const [listing, setListing] = useState<any>(null);
  const [listings, setListings] = useState<any>(null);
  const [bidListing, setBidListing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { collectionId } = router.query as { collectionId: string };

  let artistNameOrAddress: any;
  let artistProfilePic: any;
  let owner: any;
  if (listing) {
    owner = users.find((user: any) => user.address === listing.creator);
    artistNameOrAddress = owner
      ? owner?.username
      : listing?.seller
          ?.slice(0, 3)
          .concat("...")
          .concat(listing.seller.slice(-4));

    artistProfilePic = owner?.profilePicture ? owner.profilePicture : avatar;
  }
  async function createBidOrOffer(listingId: any) {
    setLoadingBid(true);
    try {
      // bidAmount // The offer amount the user entered
      if (typeof window !== "undefined") {
        const provider = new ethers.providers.Web3Provider(
          (window as CustomWindow).ethereum as any
        );

        if (listingId) {
          await (window as CustomWindow)?.ethereum?.request({
            method: "eth_requestAccounts",
          });
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            ContractAddress,
            ContractAbi,
            signer
          );
          const id = Number(listingId);
          const valueToSend = ethers.utils.parseEther(bidAmount); // Example: sending 1 Ether

          // Call the contract method with value
          const listingTx = await contract.bid(id, { value: valueToSend });
          await listingTx.wait();

          isModalClosed();
          setLoadingBid(false);
          isSuccessfulBidModalOpen();
        }
      }
    } catch (error) {
      console.error(error);
      alert(error);
      isModalClosed();
      setLoadingBid(false);
    }
  }

  const isModalOpen = () => {
    setModalOpen(true);
  };
  const isModalClosed = () => {
    setModalOpen(false);
  };

  // Modal Enlarge NFT
  const isModalOpenEnlargeNFT = () => {
    setModalOpenEnlargeNFT(true);
  };
  const isModalClosedEnlargeNFT = () => {
    setModalOpenEnlargeNFT(false);
  };
  const signer = useEthersSigner();

  const fetchlisting = async () => {
    if (collectionId) {
      setLoading(true);
      const contract = new ethers.Contract(
        ContractAddress,
        ContractAbi,
        signer
      );
      const id = Number(collectionId);
      const collectionTx = await contract.fetchCollection(id);
      const listingTx = await contract.fetchCollectionNFTs(collectionTx.id);
      // console.log(collectionTx, listingTx);
      const listings = await fetchListings({ contract, listingTx });
      const collection = await fetCollection(collectionTx);

      setListing(collection);
      setListings(listings);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchlisting();
  }, []);

  // Successful Bid Modal
  const isSuccessfulBidModalOpen = () => {
    setSuccessfulBidModal(true);
  };
  const isSuccessfulBidModalClosed = () => {
    setSuccessfulBidModal(false);
  };

  return (
    <>
      <div className="relative flex w-screen overflow-hidden sm:mt-24 max-w-[1600px] flex-col items-center content-center">
        <div className="flex justify-center realtive w-full ">
          {/* <div className="absolute translate-x-[100%] lg:translate-x-1 lg:right-[70%] xl:translate-x-0 xl:right-1/2  left-0 hidden md:block ">
            <Link
              href="/"
              className="font-ibmPlex cursor-pointer uppercase font-bold text-green text-xs z-1 absolute translate-x-[100%] lg:translate-x-1 lg:right-[70%] xl:translate-x-0 xl:right-1/2  left-0 hidden md:block -z-10"
            >
              {"<<<"} Back
            </Link>
          </div> */}
          <div className="flex flex-col h-full items-center justify-center mt-10">
            <div className="flex flex-col h-full items-center justify-center font-ibmPlex">
              {listing && (
                <Image
                  src={listing?.image as string}
                  alt={listing?.title as string}
                  width={400}
                  height={600}
                  className="w-[250px] h-[160px] max-w-[250px] mt-4 object-cover rounded-[80px]"
                  onClick={isModalOpenEnlargeNFT}
                />
              )}
              <h1 className="italic mt-2 text-xl">{listing?.title}</h1>
              <div className="flex text-xs mt-2">
                COLLECTION BY{" "}
                <div
                  onClick={() => {
                    Router.push({
                      pathname: `/user/${owner?._id}`,
                    });
                  }}
                  className="font-bold pl-2 flex cursor-pointer"
                >
                  <p>@{artistNameOrAddress}</p>
                  {listing && (
                    <Image
                      className="ml-3 -mt-1 h-6  object-cover rounded-full"
                      src={artistProfilePic}
                      height={0}
                      width={25}
                      alt="profile"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="font-ibmPlex bold text-center w-full   mt-10 pb-10  leading-5 text-xs">
              <p className="mx-4 md:mx-0">{listing?.description as string}</p>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-10 lg:mx-10 mb-10 overflow-hidden">
                <NFTCardSkeleton />

                <NFTCardSkeleton />

                <NFTCardSkeleton />
              </div>
            ) : (
              <div className="grid grid-cols-1  mt-10 sm:grid-cols-2 md:grid-cols-3 gap-10 md:mx-4 lg:mx-8 mb-10">
                {listings &&
                  listings.map((listing: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ y: 80, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      exit={{
                        opacity: 0,
                        y: 90,
                        transition: {
                          ease: "easeInOut",
                          delay: 1,
                        },
                      }}
                    >
                      <NFTCard
                        key={index}
                        users={users}
                        setLoading={setLoading}
                        listing={listing}
                        index={index}
                        user={user}
                      />
                    </motion.div>
                  ))}{" "}
              </div>
            )}

            {/*             
            
            </div>
            <div className="flex w-full mt-6 mb-10 font-ibmPlex border-t pt-5 text-xs px-4 pd:mx-0">
              {/* <div className="flex flex-1/2 flex-col w-1/2 items-start">
                <button className="text-green mb-4">
                  SHARE AND EARN 1% {">>"}
                </button>
                <button className="mb-4">VIEW ON ETHERSCAN {">"}</button>
                <button className="mb-4">VIEW METADATA {">"}</button>
                <button className="mb-4">VIEW ON IPFS {">"}</button>
              </div> */}
            {/* <div className="flex-1/2  w-1/2"> */}
            {/* <p className="text-left mb-2">HISTORY</p> */}
            {/* {bids.length && bids[0] != undefined ? (
                  bids?.map((bid: any, key: number) => (
                    <div
                      className="grid grid-cols-8  justify-between text-left mt-2"
                      key={key}
                    >
                      <div className="col-span-5 flex">
                        
                        <p className=" w-1/2 md:w-full">
                          Bid by{" "}
                          <span className="font-bold">
                            @
                            {bid?.sender?.slice(0, 6) +
                              "..." +
                              bid?.sender?.slice(36, 40)}
                          </span>{" "}
                        </p>
                      </div>
                      <div className="flex flex-grow col-span-2"></div>
                      <p className="font-bold text-green">
                        {bid?.amount} <br /> ETH
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-left mt-2">No bids yet</p>
                )} */}
            {/* </div> */}
            {/* </div> */}
          </div>
        </div>
      </div>
      <CollPlaceBidModal
        loadingBid={loadingBid}
        bidAmount={bidAmount}
        setBidAmount={setBidAmount}
        listing={bidListing}
        isModalClosed={isModalClosed}
        modalOpen={modalOpen}
        createBidOrOffer={createBidOrOffer}
        // makeOffer={makeOffer}
      />
      <CollEnlargeNFTModal
        isModalClosedEnlargeNFT={isModalClosedEnlargeNFT}
        modalOpenEnlargeNFT={modalOpenEnlargeNFT}
        listing={bidListing}
      />
      <SuccessfulBidModal
        successfulBidmodalOpen={successfulBidmodalOpen}
        isSuccessfulBidModalClosed={isSuccessfulBidModalClosed}
      />
    </>
  );
};

export default CollectionListing;
