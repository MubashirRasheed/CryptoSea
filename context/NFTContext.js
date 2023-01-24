import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';
import { create as ipfsHttpClient } from 'ipfs-http-client';

import { MarketAddress, MarketAddressAbi } from './constants';

const projectId = process.env.NEXT_PUBLIC_NFT_IPFS_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_NFT_IPFS_API_KEY_SECRET;
const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;

const Client = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

const fetchContract = (signerOrProvider) => new ethers.Contract(MarketAddress, MarketAddressAbi, signerOrProvider);

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const [currentAccount, setcurrentAccount] = useState('');
  const nftCurrency = 'ETH';

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return alert('Please install Metamask');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length) {
      setcurrentAccount(accounts[0]);
    } else {
      console.log('No account found');
    }
  };
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install Metamask');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    setcurrentAccount(accounts[0]);
    window.location.reload();
  };

  const uploadToIPFS = async (file) => {
    const subdomain = 'https://cryptosea-nft-marketplace.infura-ipfs.io';
    try {
      const added = await Client.add({ content: file });

      const url = `${subdomain}/ipfs/${added.path}`;
      return url;
    } catch (error) {
      console.log('Error uploading file to ipfs');
    }
  };

  const createNFT = async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, image: fileUrl });
    const subdomain = 'https://cryptosea-nft-marketplace.infura-ipfs.io';
    try {
      const added = await Client.add(data);

      const url = `${subdomain}/ipfs/${added.path}`;
      await createSale(url, price);
      router.push('/');
    } catch (error) {
      console.log('Error uploading file to ipfs');
    }
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    // price in ethers to wei or gwei human readable to ethereum
    const price = ethers.utils.parseUnits(formInputPrice, 'ether');
    const contract = fetchContract(signer);

    const listingPrice = await contract.getListingPrice();

    const transaction = !isReselling ? await contract.createToken(url, price, { value: listingPrice.toString() })
      : await contract.resellToken(id, price, { value: listingPrice.toString() });

    await transaction.wait();
  };

  const fetchNFTs = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/x76uPc1xwSSrSv6ATYVU3ccja_AwMh6r');
      const contract = fetchContract(provider);
      const data = await contract.fetchMarketItems();
      const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const { data: { image, name, description } } = await axios.get(tokenURI);

        // price in ethers to wei or gwei ethereum readable to human
        const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');

        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        };
      }));

      return items;
    } catch (error) {
      console.log('Please connect Metamask');
    }
  };

  const fetchMyNFTsOrListedNFTs = async (type) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);

    const data = type === 'fetchItemsListed' ? await contract.fetchItemsListed() : await contract.fetchMyItems();

    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: { image, name, description } } = await axios.get(tokenURI);

      // price in ethers to wei or gwei ethereum readable to human
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');

      return {
        price,
        tokenId: tokenId.toNumber(),
        seller,
        owner,
        image,
        name,
        description,
        tokenURI,
      };
    }));

    return items;
  };

  const buyNFT = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

    const transaction = await contract.createMarketSale(nft.tokenId, { value: price });

    await transaction.wait();
  };

  return (
    <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount, uploadToIPFS, createNFT, fetchNFTs, fetchMyNFTsOrListedNFTs, buyNFT, createSale }}>
      {children}
    </NFTContext.Provider>
  );
};
