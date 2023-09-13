import React, { useState, useEffect, FunctionComponent } from "react";
import Modal from "react-modal";
import Image from "next/image";
import { ethers } from "ethers";
import { ContractAbi, ContractAddress } from "../utils/constants";
import ButtonSpinner from "../LoadingSkeletons/ButtonSpinner";
import { useBalance, useAccount } from "wagmi";
import { useAuthedProfile } from "../../context/UserContext";

type Props = {
  modalOpen: boolean;
  isModalClosed: () => void;
  listing: object | any;
  listingId: any;
  isSuccessfullOfferModalOpen: () => void;
};

const MakeOfferModal: FunctionComponent<Props> = ({
  modalOpen,
  isModalClosed,
  listing,
  listingId,
  isSuccessfullOfferModalOpen,
}) => {
  // const [isOpenModal, setIsOpenModal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { authedProfile } = useAuthedProfile();

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
  const [balance, setBalance] = useState<any>(0);
  // const [address, setAddress] = useState<string>("");
  const [auth, setAuth] = useState<boolean>(false);
  const [offerAmount, setOfferAmount] = useState<string>("");

  const { address } = useAccount();
  const { data, isError } = useBalance({
    address,
  });

  // const getBalance = async () => {

  //     // Return the first account address
  //     const address = accounts[0];
  //     setAddress(address);
  //     if (listing.owner !== undefined) {
  //       let listingAdrress = listing.owner;
  //       listingAdrress = listingAdrress.toLowerCase();
  //       setAuth(listingAdrress === address);
  //     }
  //     // console.log(mainaddress == "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 ");

  //     // Get the balance of the specified address
  //     const balance = await provider.getBalance(address);

  //     // Convert the balance to Ether units
  //     const bal = ethers.utils.formatEther(balance);

  //     const balanceInEther = parseFloat(Number(bal).toFixed(3));

  //     setBalance(balanceInEther);

  // };

  // useEffect(() => {
  //   getBalance();
  // }, []);

  // Make Offer Function
  const makeOffer = async () => {
    setIsLoading(true);
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      if (listingId) {
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          ContractAddress,
          ContractAbi,
          signer
        );
        const id = Number(listingId);
        const valueToSend = ethers.utils.parseEther(offerAmount); // Example: sending 1 Ether

        // Call the contract method with value
        const listingTx = await contract.makeOffer(listing.id, {
          value: valueToSend,
        });
        await listingTx.wait();
        setIsLoading(false);
        isModalClosed();
        isSuccessfullOfferModalOpen();
      }
    } catch (error) {
      console.error(error);
      alert(error);
    } finally {
      setIsLoading(false);
      isModalClosed();
    }
  };

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
                  <h1 className="fontCompress tracking-wider font-compressed text-3xl mb-8">
                    {listing.timeElapse
                      ? listing.sold
                        ? auth
                          ? "RESALE"
                          : "ENDED"
                        : "END NOW"
                      : listing.endTime != 0
                      ? listing.endTime
                      : "place bid"}
                  </h1>

                  <div className=" grid grid-cols-2 md:grid-cols-3 gap-6 w-full mt-3">
                    <div className=" flex text-left">
                      {" "}
                      <p className="pr-6 font-bold text-green">
                        Offer <br /> Amount
                      </p>
                      <input
                        type="number"
                        name="bidAmount"
                        pattern="[0-9]+"
                        placeholder="0.00  ETH"
                        onChange={(e) => setOfferAmount(e.target.value)}
                        className="border bg-transparent  pl-2 focus:outline-green"
                      />
                    </div>
                    <div className="flex grow"></div>
                    <div className=" flex text-left">
                      {" "}
                      <p className="pr-6 font-bold text-green ">
                        Your <br /> Balance
                      </p>
                      <p className="font-bold">
                        {Number(data?.formatted).toFixed(3)} <br /> ETH
                      </p>
                    </div>
                  </div>
                  {isLoading ? (
                    <div className="mt-6">
                      <ButtonSpinner />
                      <p className="font-ibmPlex text-xs  tracking-normal mt-3">
                        Processing...
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={makeOffer}
                      className="bg-green flex justify-center whitespace-nowrap text-black  font-xCompressed  w-full uppercase tracking-[8px] mt-3   hover:bg-opacity-80 py-[1.2vh] px-[2vw]  z-2 text-2xl  "
                    >
                      Make Offer
                    </button>
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

export default MakeOfferModal;
