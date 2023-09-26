import React, { useState, useEffect, FunctionComponent } from "react";
import Modal from "react-modal";
import Image from "next/image";
import { ethers } from "ethers";
import ButtonSpinner from "../LoadingSkeletons/ButtonSpinner";

type Props = {
  modalOpen: boolean;
  isModalClosed: () => void;
  listing: object | any;
  bidAmount: string;
  setBidAmount: (bidAmount: string) => void;
  createBidOrOffer: () => void;
  withBid: () => void;
  resale: () => void;
  loadingBid: boolean;
};

const PlaceBidModal: FunctionComponent<Props> = ({
  modalOpen,
  isModalClosed,
  listing,
  bidAmount,
  setBidAmount,
  createBidOrOffer,
  withBid,
  resale,
  loadingBid,
}) => {
  // const [isOpenModal, setIsOpenModal] = useState(true);
  // const [isLoading, setIsLoading] = useState(false);

  const customStyles = {
    overlay: {
      backgroundColor: "rgb(25, 25, 25, 0.85)",
    },
    content: {
      zIndex: "20",
      top: "50%",
      left: "50%",
      minWidth: "40vw",
      right: "auto",
      bottom: "auto",
      display: "flex",
      justifyContent: "center",
      backgroundColor: "black",
      marginRight: "-50%",
      borderRadius: "25px",
      transform: "translate(-50%, -50%)",
    },
  };
  // initializing state for balance
  const [balance, setBalance] = useState<number>(0);
  const [address, setAddress] = useState<string>("");
  const [auth, setAuth] = useState<boolean>(false);

  const getBalance = async () => {
    if ((window as CustomWindow).ethereum) {
      const provider = new ethers.providers.Web3Provider(
        (window as CustomWindow).ethereum as any
      );
      // Request access to the user's Ethereum accounts (MetaMask, etc.)
      const accounts = await (window as CustomWindow).ethereum.request({
        method: "eth_requestAccounts",
      });

      // Return the first account address
      const address = accounts[0];
      setAddress(address);
      if (listing.owner !== undefined) {
        let listingAdrress = listing.owner;
        listingAdrress = listingAdrress.toLowerCase();
        setAuth(listingAdrress === address);
      }
      // console.log(mainaddress == "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 ");

      // Get the balance of the specified address
      const balance = await provider.getBalance(address);

      // Convert the balance to Ether units
      const bal = ethers.utils.formatEther(balance);
      const balanceInEther = parseFloat(Number(bal).toFixed(2));

      setBalance(balanceInEther);
    }
  };

  useEffect(() => {
    getBalance();
  }, []);

  return (
    <div>
      {" "}
      <Modal
        style={customStyles}
        isOpen={modalOpen}
        onRequestClose={isModalClosed}
        ariaHideApp={false}
      >
        <>
          {listing ? (
            <div className="flex flex-col z-12 text-ibmPlex h-full w-full md:w-[70%]  mx-5 overflow-hidden justify-between">
              <div className="flex flex-col h-full">
                {/* <div className="flex grow"></div> */}
                {listing ? (
                  <div className=" overflow-hidden h-full flex justify-center items-center mb-3">
                    <Image
                      src={listing?.image}
                      alt={listing?.title}
                      width={200}
                      height={300}
                      className="w-full max-h-[35vh] min-h-[250px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center w-[100dvw] mt-32">
                    <div className="relative w-24 h-24 animate-spin rounded-full bg-gradient-to-r from-black via-blue-500 to-green ">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-black rounded-full "></div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col w-full font-ibmPlex mb-4 uppercase text-xs text-[#e4e8eb] ">
                  {/* <h1 className="fontCompress tracking-wider font-compressed text-3xl mb-8">
                    {listing.timeElapse
                      ? listing.sold
                        ? auth
                          ? "RESALE"
                          : "ENDED"
                        : "END NOW"
                      : listing.endTime != 0
                      ? listing.endTime
                      : "place bid"}
                  </h1> */}
                  <div className=" grid grid-cols-4 sm:grid-cols-5 gap-6 w-full mt-3">
                    <div className="flex text-left col-span-2">
                      {" "}
                      <p className="pr-4">
                        Reserve <br /> Price
                      </p>
                      <p className="font-bold ">
                        {listing.price} <br /> ETH
                      </p>
                    </div>
                    <div className="hidden sm:flex grow"></div>
                    <div className=" flex text-left justify-end">
                      {" "}
                      <p className=" ">
                        Current <br /> Bid
                      </p>
                    </div>
                    <div className=" flex text-left justify-end">
                      <p className="font-bold text-green">
                        {listing.Bid == 0 ? listing.Bid + ".00" : listing.Bid}{" "}
                        <br /> <span className="flex justify-end"> ETH</span>
                      </p>
                    </div>

                    <div className="flex text-left col-span-2">
                      {" "}
                      <p className="pr-6 font-bold text-green">
                        Bid <br /> Amount
                      </p>
                      <input
                        type="number"
                        name="bidAmount"
                        pattern="[0-9]+"
                        placeholder="0.00  ETH"
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="border bg-transparent w-full pl-2 focus:outline-green"
                      />
                    </div>
                    <div className="hidden sm:flex grow"></div>
                    <div className=" flex text-left justify-end">
                      {" "}
                      <p className="font-bold text-green ">
                        Your <br /> Balance
                      </p>
                    </div>
                    <div className=" flex text-left justify-end">
                      <p className="font-bold">
                        {balance} <br />{" "}
                        <span className="flex justify-end"> ETH</span>
                      </p>
                    </div>
                  </div>
                  {listing.timeElapse ? (
                    <>
                      {auth && listing.sold ? (
                        <button
                          onClick={resale}
                          className="fontCompress text-green mt-6 border border-green font-xxCompressed w-[100%] uppercase tracking-[8px] py-1 bg-white bg-opacity-20 hover:bg-opacity-30 font-semibold text-xl  "
                        >
                          RESALE
                        </button>
                      ) : listing.sold ? (
                        <button
                          onClick={withBid}
                          className="fontCompress text-green mt-6 border border-green font-xxCompressed w-[100%] uppercase tracking-[8px] py-1 bg-white bg-opacity-20 hover:bg-opacity-30 font-semibold text-xl  "
                        >
                          WITHDRAW
                        </button>
                      ) : (
                        <button
                          // onClick={endBid}
                          className="fontCompress text-green mt-6 border border-green font-xxCompressed w-[100%] uppercase tracking-[8px] py-1 bg-white bg-opacity-20 hover:bg-opacity-30 font-semibold text-xl  "
                        >
                          END
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {!listing.isPrimary && (
                        <button
                          className="fontCompress text-green mt-6 border border-green font-xxCompressed w-[100%] uppercase tracking-[8px] py-1 bg-white bg-opacity-20 hover:bg-opacity-30 font-semibold text-xl  "
                          onClick={withBid}
                        >
                          Withdraw Bid
                        </button>
                      )}
                      {loadingBid ? (
                        <div className="mt-6">
                          <ButtonSpinner />
                          <p className="font-ibmPlex text-xs  tracking-normal mt-3">
                            Processing...
                          </p>
                        </div>
                      ) : (
                        <button
                          className="fontCompress  mt-6  font-xxCompressed w-[100%] uppercase tracking-[8px] py-1 text-black   bg-green  hover:bg-opacity-80 font-semibold text-2xl  transition duration-200 ease-in-out"
                          onClick={createBidOrOffer}
                        >
                          Place Bid
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </>
      </Modal>
    </div>
  );
};

export default PlaceBidModal;
