import axios from "axios";
import Ipfs from "./Ipfs";

const readIPFSContent = async (hash) => {
  try {
    // Fetch the content from IPFS
    const response = await axios.get(`https://ipfs.io/ipfs/${hash}`);
    if (!response.data.length > 1) {
      throw new Error("Failed to fetch IPFS content");
    }
    const image = `https://ipfs.io/ipfs/${response.data.image}`;
    const title = response.data.title;
    const description = response.data.description;
    return { image, title, description };
  } catch (error) {
    console.error("Error reading IPFS content:", error);
  }
};

const addImageToIpfs = async (image) => {
  const { cid } = await Ipfs.add(image);
  return cid.toString();
};

export const submitToIpfs = async (collectionData) => {
  console.log(collectionData);
  const { description, image } = collectionData;
  if (description && image) {
    const imageCd = await addImageToIpfs(image);
    const title = collectionData.collectionName
      ? collectionData.collectionName
      : collectionData.name;
    const data = {
      title: title,
      description: description,
      image: imageCd,
    };

    const { cid } = await Ipfs.add(JSON.stringify(data));
    const tokenUrl = cid.toString();
    return tokenUrl;
  }
};

export const fetchListings = async (data) => {
  const { contract, listingTx } = data;
  // console.log(listingTx + " listingsTX");
  let mainNfts = [];
  if (listingTx) {
    for await (const response of listingTx) {
      let timeElapse = false;
      let time = Number(response.endTime);
      if (Number(response.endTime) !== 0) {
        const currentTime = new Date().getTime();
        const uintTimestamp = Math.floor(currentTime / 1000);
        timeElapse = uintTimestamp > Number(response.endTime);
        // Convert timestamp to milliseconds
        const milliseconds = response.endTime - uintTimestamp;
        const difference = Number(milliseconds * 1000);
        // Create a new Date object with the converted milliseconds
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        const sumUp = hours * 3600 + minutes * 60 + seconds;
        time = sumUp > 0 ? sumUp : "";
      }
      const id = Number(response.tokenId);
      const tokenUrl = await contract.tokenURI(id);
      let Bid = await contract.gethighestBid(response.tokenId);
      let highestBidder = await contract.gethighestBidder(response.tokenId);
      Bid = Number(Bid) / 1e18;
      const { image, title, description } =
        (await readIPFSContent(tokenUrl)) ?? {};
      const nft = {
        id: Number(response.tokenId),
        title: title,
        image: image,
        price: Number(response.price) / 1e18,
        Bid: Bid,
        highestBidder: highestBidder,
        isPrimary: response.isPrimary,
        collectionId: Number(response.collectionId),
        seller: response.seller,
        owner: response.owner,
        details: description,
        sold: response.sold,
        isPrimary: response.isPrimary,
        timeElapse: timeElapse,
        endTime: time,
      };
      mainNfts.push(nft);
    }
  }
  return mainNfts;
};

export async function* fetchListingsBatch(data) {
  const { contract, listingTx } = data;

  const processListing = async (response) => {
    try {
      const id = Number(response.tokenId);
      const tokenUrl = await contract.tokenURI(id);
      const { image, title, description } = await readIPFSContent(tokenUrl);

      let Bid = await contract.gethighestBid(response.tokenId);
      let highestBidder = await contract.gethighestBidder(response.tokenId);
      Bid = Number(Bid) / 1e18;

      let timeElapse = false;
      let time = Number(response.endTime);
      if (time !== 0) {
        const currentTime = Math.floor(Date.now() / 1000);
        timeElapse = currentTime > time;
        time = time - currentTime;
      }

      return {
        id,
        title,
        image,
        price: Number(response.price) / 1e18,
        Bid,
        highestBidder,
        isPrimary: response.isPrimary,
        collectionId: Number(response.collectionId),
        seller: response.seller,
        owner: response.owner,
        details: description,
        sold: response.sold,
        timeElapse,
        endTime: time,
      };
    } catch (error) {
      console.error("Error processing listing:", error);
      return null;
    }
  };

  const processBatch = async (batch) => {
    return Promise.all(batch.map(processListing));
  };

  for (let i = 0; i < listingTx.length; i += 3) {
    const batch = listingTx.slice(i, i + 3);
    const processedBatch = await processBatch(batch);
    yield processedBatch.filter((nft) => nft !== null); // Yield only successfully processed listings
  }
}

export const fetchcontractListings = async (collectionTx) => {
  let collections = [];
  if (collectionTx) {
    for await (const response of collectionTx) {
      const { image, title, description } =
        (await readIPFSContent(response.collectionUrl)) ?? {};
      const collection = {
        id: Number(response.id),
        title: title,
        image: image,
        description: description,
        creator: response.creator,
        counter: Number(response.counter),
        Tokensymbol: response.Tokensymbol,
      };
      collections.push(collection);
    }
  }
  return collections;
};

export const fetchListing = async ({ contract, listingTx }) => {
  // console.log(listingTx);
  let timeElapse = false;
  let time = 0;
  if (Number(listingTx.endTime) !== 0) {
    const currentTime = new Date().getTime();
    const uintTimestamp = Math.floor(currentTime / 1000);
    timeElapse = uintTimestamp > Number(listingTx.endTime);
    // Convert timestamp to milliseconds
    const milliseconds = listingTx.endTime - uintTimestamp;
    const difference = Number(milliseconds * 1000);
    // Create a new Date object with the converted milliseconds
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const sumUp = hours * 3600 + minutes * 60 + seconds;
    time = sumUp > 0 ? sumUp : "";
  }

  const tokenUrl = await contract.tokenURI(listingTx.tokenId);
  let Bid = await contract.gethighestBid(listingTx.tokenId);
  let highestBidder = await contract.gethighestBidder(listingTx.tokenId);

  Bid = Number(Bid) / 1e18;
  const { image, title, description } = await readIPFSContent(tokenUrl);
  const nft = {
    id: Number(listingTx.tokenId),
    title: title,
    image: image,
    price: Number(listingTx.price) / 1e18,
    Bid: Bid,
    highestBidder: highestBidder,
    isPrimary: listingTx.isPrimary,
    collectionId: Number(listingTx.collectionId),
    seller: listingTx.seller,
    owner: listingTx.owner,
    description: description,
    sold: listingTx.sold,
    isPrimary: listingTx.isPrimary,
    timeElapse: timeElapse,
    endTime: time,
  };
  console.log(nft);
  return nft;
};

export const fetCollectiontitle = async (collectionTx) => {
  if (collectionTx.length > 0) {
    let collections = [];
    for await (const response of collectionTx) {
      const { title, image } = await readIPFSContent(response.collectionUrl);
      const item = {
        title,
        id: response.id,
        tokensymbol: response.Tokensymbol,
        creator: response.creator,
        image,
      };
      collections.push(item);
    }
    return collections;
  } else {
    return [];
  }
};

export const fetCollection = async (collectionTx) => {
  const { title, description, image } = await readIPFSContent(
    collectionTx.collectionUrl
  );
  const item = {
    title,
    id: collectionTx.id,
    description: description,
    tokensymbol: collectionTx.Tokensymbol,
    creator: collectionTx.creator,
    image,
  };
  return item;
};
