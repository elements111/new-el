import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useAddress, useMetamask, useDisconnect } from "@thirdweb-dev/react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ProfileMenu() {
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();
  return (
    <Menu as="div" className="relative inline-block">
      {!address ? (
        <a
          className="text-center"
          href="#"
          onClick={() => connectWithMetamask()}
        >
          Connect Wallet
        </a>
      ) : (
        <>
          <div>
            <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-full  shadow-sm ring-1 ring-inset5">
              <div className="h-6 w-6 bg-green rounded-full hover:opacity-80"></div>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 text-left z-10 mt-2 w-56 origin-top-right rounded-md bg-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1 font-ibmPlex text-green">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/profile"
                      className={classNames(
                        active ? "bg-gray-400 text-white" : "text-white",
                        " px-4 py-2 text-xl uppercase font-bold flex items-center justify-start"
                      )}
                    >
                      <div className="h-5 w-5 bg-green rounded-full mr-3"></div>
                      my profile {">"}
                      {">"}
                    </a>
                  )}
                </Menu.Item>
                <div className="flex items-center">
                  <p className="block px-4 py-2 text-xs text-white">
                    {address
                      .slice(0, 6)
                      .concat("...")
                      .concat(address.slice(-4))}
                  </p>
                  <div className="h-2 w-2 bg-green rounded-full mr-3"></div>
                </div>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-gray-400 text-green" : "text-green",
                        "block px-4 py-2 text-xs"
                      )}
                    >
                      {">"}
                      {">"}
                      {">"} Settings
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-gray-400 text-green" : "text-green",
                        "block px-4 py-2 text-xs"
                      )}
                    >
                      {">"}
                      {">"}
                      {">"} help
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <>
                      {!address ? (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-400 text-green" : "text-green",
                            "block px-4 py-2 text-xs hover:bg-gray-400"
                          )}
                          onClick={() => connectWithMetamask()}
                        >
                          Connect Wallet
                        </a>
                      ) : (
                        <>
                          <a
                            href="#"
                            className={classNames(
                              active ? "bg-gray-400 text-green" : "text-green",
                              "block px-4 py-2 text-xs  hover:bg-gray-400"
                            )}
                            onClick={() => disconnectWallet()}
                          >
                            {">"}
                            {">"}
                            {">"} Disconnect Wallet
                          </a>
                        </>
                      )}
                    </>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}