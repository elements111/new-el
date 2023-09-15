import { Router, useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../../styles/Home.module.css";
import Image from "next/image";
import PlaceBidModal from "./PlaceBidModal";
import EnlargeNFTModal from "./EnlargeNFTModal";
import { ethers } from "ethers";
import { ContractAbi, ContractAddress } from "../utils/constants";
import { fetchListing } from "../utils/utils";
import EndAuctionModal from "./EndAuctionModal";
import SuccessfullBidModal from "./SuccessfulBidModal";
import useAuthedProfile from "../../context/UserContext";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  getArtist,
  artistNameOrAddress,
  artistProfilePic,
  owner,
} from "../../lib/functions";
import Countdown from "react-countdown";
import { useEthersSigner } from "../utils/getSigner";
import AddEmailModal from "./AddEmailModal";
const { BigNumber } = require("ethers");

const ListingComponent: any = ({ users, listing, bids }: any) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loadingListing, setloadingListing] = useState<boolean>(true);
  const [loadingBid, setLoadingBid] = useState<boolean>(false);
  const [modalOpenEnlargeNFT, setModalOpenEnlargeNFT] =
    useState<boolean>(false);
  const [modalEndOpen, setModalEndOpen] = useState<boolean>(false);
  const [addEmailModalOpen, setAddEmailModalOpen] = useState<boolean>(false);
  const [successfulBidmodalOpen, setSuccessfulBidModal] =
    useState<boolean>(false);
  const { authedProfile } = useAuthedProfile();
  const { openConnectModal } = useConnectModal();

  const router = useRouter();

  // De-construct listingId out of the router.query.
  const { listingId } = router.query as { listingId: string };
  console.log(listing);

  getArtist(users, listing);
  console.log(authedProfile);

  // Store the bid amount the user entered into the bidding textbox
  const [bidAmount, setBidAmount] = useState<string>("");

  if (!loadingListing) {
    return (
      <div className={`font-ibmPlex ${styles.loadingOrError}`}>Loading...</div>
    );
  }

  if (!listing) {
    return (
      <div className={`font-ibmPlex ${styles.loadingOrError}`}>
        Listing not found
      </div>
    );
  }
  const signer = useEthersSigner();

  async function createBidOrOffer() {
    setLoadingBid(true);
    try {
      // bidAmount // The offer amount the user entered

      if (listingId) {
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
    } catch (error) {
      console.error(error);
      alert(error);
      isModalClosed();
      setLoadingBid(false);
    }
  }

  async function endBid() {
    setLoadingBid(true);
    try {
      // bidAmount // The offer amount the user entered

      if (listingId) {
        const contract = new ethers.Contract(
          ContractAddress,
          ContractAbi,
          signer
        );
        const id = Number(listingId);
        // const valueToSend = ethers.utils.parseEther(bidAmount); // Example: sending 1 Ether
        console.log(id);

        // Call the contract method with value
        const listingTx = await contract.end(id);
        await listingTx.wait();
      }
    } catch (error) {
      console.error(error);
      alert(error);
    } finally {
      isModalEndClosed();
      setLoadingBid(false);
      router.push("/profile");
    }
  }
  async function withBid() {
    try {
      // bidAmount // The offer amount the user entered

      if (listingId) {
        const contract = new ethers.Contract(
          ContractAddress,
          ContractAbi,
          signer
        );
        const id = Number(listingId);
        const valueToSend = ethers.utils.parseEther(bidAmount); // Example: sending 1 Ether

        // Call the contract method with value
        const listingTx = await contract.withdrawBids(id);
        isModalClosed();
      }
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }
  async function resale() {
    try {
      const contract = new ethers.Contract(
        ContractAddress,
        ContractAbi,
        signer
      );
      const id = Number(listingId);
      // const price = ethers.utils.parseEther(bidAmount); // Example: sending 1 Ether

      // Call the contract method with value
      const resellTx = await contract.reSellToken(id, bidAmount);
      resellTx.wait();
      isModalClosed();
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  // Modal Place Bid
  const isModalOpen = () => {
    if (authedProfile) {
      if (authedProfile?.email === "") {
        isAddEmailModalOpen();
      } else {
        setModalOpen(true);
      }
    } else {
      return;
    }
  };
  const isModalClosed = () => {
    setModalOpen(false);
  };
  // Modal End Auction
  const isModalEndOpen = () => {
    setModalEndOpen(true);
  };
  const isModalEndClosed = () => {
    setModalEndOpen(false);
  };
  // Modal Enlarge NFT
  const isModalOpenEnlargeNFT = () => {
    setModalOpenEnlargeNFT(true);
  };
  const isModalClosedEnlargeNFT = () => {
    setModalOpenEnlargeNFT(false);
  };
  // Successful Bid Modal
  const isSuccessfulBidModalOpen = () => {
    setSuccessfulBidModal(true);
  };
  const isSuccessfulBidModalClosed = () => {
    setSuccessfulBidModal(false);
  };
  // Add Email Modal
  const isAddEmailModalOpen = () => {
    setAddEmailModalOpen(true);
  };
  const isAddEmailModalClosed = () => {
    setAddEmailModalOpen(false);
  };
  const renderer = ({ hours, minutes, seconds, completed }: any) => {
    if (completed) {
      // Render a complete state
      return <> {listing.timeElapse ? <span> Auction Ended</span> : null}</>;
    } else {
      // Render a countdown
      return (
        <span>
          Ends In <span className="mr-8" /> {hours < 10 ? "0" + hours : hours}H{" "}
          <span className="mr-4" />
          {minutes < 10 ? "0" + minutes : minutes}M <span className="mr-4" />
          {seconds < 10 ? "0" + seconds : seconds}S
        </span>
      );
    }
  };

  if (listing) {
    return (
      <>
        <div className="flex flex-col realtive h-full items-center container lg:w-[98dvw]  mt-[6.5rem]  overflow-x-hidden justify-between">
          <div className="flex justify-center realtive w-3/4">
            <div className="absolute translate-x-[100%] lg:translate-x-1 lg:right-[70%] xl:translate-x-0 xl:right-1/2  left-0 hidden md:block -z-0">
              <button
                onClick={() => router.back()}
                className="font-ibmPlex cursor-pointer uppercase font-bold text-green text-xs -z-10"
              >
                {"<<<"} Back
              </button>
            </div>
            <div className="flex flex-col h-full items-center justify-center">
              <div className="w-full lg:w-max">
                <div className=" min-w-[350px]  lg:max-w-[50vw] cursor-pointer">
                  <Image
                    src={listing?.image as string}
                    alt={listing?.title as string}
                    width={400}
                    height={600}
                    className="w-full mb-2 object-contain cursor-pointer"
                    onClick={isModalOpenEnlargeNFT}
                  />{" "}
                  <div className="flex flex-col font-ibmPlex mb-4 uppercase text-xs text-[#e4e8eb] mt-3">
                    <div className=" grid grid-cols-4 sm:grid-cols-5 gap-6 w-full mt-3">
                      <div className="text-left col-span-2">
                        <p>{listing?.title}</p>
                      </div>
                      <div className="hidden sm:flex grow"></div>
                      <div className=" flex text-left justify-end -mr-5">
                        {" "}
                        <p className="">
                          Reserve <br /> Price
                        </p>
                      </div>
                      <div className=" flex text-left justify-end">
                        <p className="font-bold ">
                          {listing.price} <br /> ETH
                        </p>
                      </div>

                      <div
                        onClick={() => {
                          router.push({
                            pathname: `/user/${owner?._id}`,
                          });
                        }}
                        className="font-bold text-left flex cursor-pointer  mt-3 col-span-2"
                      >
                        <p> BY @{artistNameOrAddress}</p>
                        <Image
                          className="ml-3 -mt-1 h-6 cursor-pointer object-cover rounded-full"
                          src={artistProfilePic}
                          height={0}
                          width={25}
                          alt={""}
                        />
                      </div>

                      <div className="hidden sm:flex grow"></div>
                      <div className=" flex text-left justify-end -mr-5">
                        {" "}
                        <p className="">
                          Current <br /> Bid
                        </p>
                      </div>
                      <div className=" flex text-left justify-end">
                        <p className="font-bold text-green">
                          {listing.Bid == 0 ? listing.Bid + ".00" : listing.Bid}{" "}
                          <br /> ETH
                        </p>
                      </div>
                    </div>
                    <div className=" flex mt-3">
                      <div className="flex grow"></div>

                      <div className=" flex font-bold w-full text-green">
                        {listing.timeElapse ? null : (
                          <button
                            onClick={
                              authedProfile ? isModalOpen : openConnectModal
                            }
                            className="font-xCompressed  w-full  uppercase tracking-[8px] py-1 text-black   bg-green  hover:bg-opacity-80 font-semibold text-2xl  "
                          >
                            place bid
                          </button>
                        )}
                      </div>
                      <div className="flex grow"></div>
                    </div>
                  </div>
                </div>
                {listing.timeElapse &&
                listing.seller == authedProfile?.address ? (
                  <div className="font-ibmPlex w-full md:min-w-1 flex items-center justify-between">
                    <button
                      className=" text-black font-xCompressed  w-full  uppercase tracking-[8px] py-1 bg-green hover:bg-opacity-80 font-semibold text-2xl  transition duration-200 ease-in-out"
                      onClick={listing.timeElapse && isModalEndOpen}
                    >
                      {listing.timeElapse
                        ? listing.sold
                          ? "ENDED"
                          : "claim eth NOW"
                        : "place bid"}
                    </button>
                  </div>
                ) : null}
                <div className=" flex font-bold text-green font-ibmPlex justify-center uppercase">
                  {listing.timeElapse ? (
                    <>
                      <p className="pr-5 mt-2">Auction ended</p>
                    </>
                  ) : (
                    <>
                      <Countdown
                        date={Date.now() + listing.endTime * 1000}
                        renderer={renderer}
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="font-ibmPlex bold text-center w-full   mt-10 pb-10 border-b leading-5 text-xs">
                <p className="md:w-[50vw]">{listing?.description}</p>
              </div>
              <div className="flex w-full mt-6 mb-10 font-ibmPlex text-xs">
                <div className="flex flex-1/2 flex-col w-1/2 items-start">
                  <button className="text-green mb-4">
                    SHARE AND EARN 1% {">>"}
                  </button>
                  <button className="mb-4">VIEW ON ETHERSCAN {">"}</button>
                  <button className="mb-4">VIEW METADATA {">"}</button>
                  <button className="mb-4">VIEW ON IPFS {">"}</button>
                </div>
                <div className="flex-1/2  w-1/2">
                  <p className="text-left mb-2">HISTORY</p>
                  {bids.length && bids[0] != undefined ? (
                    bids?.map((bid: any, key: number) => (
                      <div
                        className="grid grid-cols-8  justify-between text-left mt-2"
                        key={key}
                      >
                        <div className="col-span-5 flex">
                          {/* <Image
                            src={profile}
                            width={30}
                            height={10}
                            alt="profile picture"
                            className="hidden md:block h-fit"
                            key={key}
                          /> */}

                          <p className=" w-1/2 md:w-full">
                            Bid by{" "}
                            <span className="font-bold">
                              @
                              {bid?.sender?.slice(0, 6) +
                                "..." +
                                bid?.sender?.slice(36, 40)}
                            </span>{" "}
                            {/* <br /> Jan 15, 2023 at 7.31pm */}
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <PlaceBidModal
          bidAmount={bidAmount}
          setBidAmount={setBidAmount}
          listing={listing}
          isModalClosed={isModalClosed}
          modalOpen={modalOpen}
          createBidOrOffer={createBidOrOffer}
          withBid={withBid}
          resale={resale}
          loadingBid={loadingBid}
        />
        <EnlargeNFTModal
          isModalClosedEnlargeNFT={isModalClosedEnlargeNFT}
          modalOpenEnlargeNFT={modalOpenEnlargeNFT}
          listing={listing}
        />
        <EndAuctionModal
          listing={listing}
          isModalEndClosed={isModalEndClosed}
          modalEndOpen={modalEndOpen}
          endBid={endBid}
          resale={resale}
          loadingBid={loadingBid}
        />
        <SuccessfullBidModal
          successfulBidmodalOpen={successfulBidmodalOpen}
          isSuccessfulBidModalClosed={isSuccessfulBidModalClosed}
        />
        <AddEmailModal
          addEmailModalOpen={addEmailModalOpen}
          isAddEmailModalClosed={isAddEmailModalClosed}
        />
      </>
    );
  }
};

export default ListingComponent;
