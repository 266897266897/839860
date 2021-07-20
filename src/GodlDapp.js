import React from "react";
import { useEffect, useState } from "react";
import {
  connectWallet,
  getSymbol,
  getTotalDividendsDistributed,
  getAccountDividendsInfo,
  getAccountDividendsInfoAtIndex,
  getNumberOfDividendTokenHolders,
  getLastProcessedIndex,
  balanceOf,
  getCurrentTokenPrice,
  getCurrentWalletConnected,
  decimals,
  fromWei,
  shortenAddress,
  defaultAddress,
} from "./Godl.js";

import logo from "./godl.png";

const PrintGlobalDividends = ({data}) => (
  <div id="totalDividends">
    <b>Total ETH Dividends:</b> Ξ{data}
  </div>
  );

const PrintAddress = ({data}) => (
  <div>
    <b>Address: </b>
    <span>{shortenAddress(data)}
      <a href={"https://etherscan.io/address/" + data}>
       <sup>1</sup>
      </a>
    </span>
  </div>
  );

const PrintBalance = ({data}) => (
  <div>
    <b>Balance: </b>{data}
  </div>
  );

const PrintIndex = ({data}) => (
  <div>
    <b>Index: </b>{data}
  </div>
  );

const PrintLastProcessedIndex = ({data}) => (
  <div>
    <b>Last processed index:</b> {data}
  </div>
  );

const PrintDividends = ({data}) => (
  <div>
    <b>Withdrawable dividends:</b> Ξ{data}
  </div>
  );

const PrintTotalDividends = ({data}) => (
  <div>
    <b>Total user dividends:</b> Ξ{data}
  </div>
  );

const PrintClaimTime = ({data}) => (
  <div>
    <b>Last claim time:</b> {data} seconds
  </div>
  );

const PrintSecondsUntilAutoClaimTime = ({data}) => (
  <div>
    <b>Auto claim available:</b> {data} seconds
  </div>
  );

const PrintIterationsUntilProcessed = ({data}) => (
  <div>
    <b>Iterations until processed:</b> {data}
  </div>);

const GodlDapp = () => {

const errorMessage = "No connection to the network.";

const [walletAddress, setWallet] = useState(""); // default?
const [address, setAddress] = useState("");
const [status, setStatus] = useState("");
const [symbol, setSymbol] = useState(errorMessage); 
const [totalDividendsDistributed, setTotalDividendsDistributed] = useState(errorMessage); 
const [accountDividendsInfo, setAccountDividendsInfo] = useState(errorMessage); 
const [numberOfDividendTokenHolders, setNumberOfDividendTokenHolders] = useState(errorMessage);
const [lastProcessedIndex, setLastProcessedIndex] = useState(errorMessage);
const [currentTokenPrice, setCurrentTokenPrice] = useState(errorMessage);
const [addressBalance, setAddressBalance] = useState(errorMessage);
const [info, setInfo] = useState("");
const [index, setIndex] = useState("");

const date =  new Date().toLocaleString()

useEffect(async () => {

  const {address, status} = await getCurrentWalletConnected();

  setWallet(address)
  setStatus(status); 

  const symbol = await getSymbol();
  setSymbol(symbol);

  const currentTokenPrice = await getCurrentTokenPrice();
  setCurrentTokenPrice(currentTokenPrice.godl.usd);

  const lastProcessedIndex = await getLastProcessedIndex();
  setLastProcessedIndex(lastProcessedIndex);

  const totalDividendsDistributed = await getTotalDividendsDistributed();
  setTotalDividendsDistributed(totalDividendsDistributed);

  const numberOfDividendTokenHolders = await getNumberOfDividendTokenHolders();
  setNumberOfDividendTokenHolders(numberOfDividendTokenHolders);

  getDividendInformation(address ? address : defaultAddress);

  addWalletListener(); 

}, []); //called only once

const getDividendInformation = async(a) => {
  if(a.substring(0,2) === "0x") {
    const accountDividendsInfo = await getAccountDividendsInfo(a);
    setAccountDividendsInfo(accountDividendsInfo);
    const addressBalance = await balanceOf(a);
    setAddressBalance(addressBalance);
  } else {
    if(a <= 0) return;
    const accountDividendsInfo = await getAccountDividendsInfoAtIndex(a);
    setAccountDividendsInfo(accountDividendsInfo);
    const addressBalance = await balanceOf(accountDividendsInfo[0]);
    setAddressBalance(addressBalance);
  }
}

function addWalletListener() { 
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        setWallet(accounts[0]);
        setStatus("Connected.");
        getDividendInformation(accounts[0]);
      } else {
        setWallet("");
        setStatus("Connect to Metamask using Connect Wallet button.");
      }
    });
  } else {
    setStatus(
      <p> {" "} 🦊 {" "} You must install Metamask in your browser. </p>
      );
  }
}

const connectWalletPressed = async () => {
  const walletResponse = await connectWallet();
  setStatus(walletResponse.status);
  setWallet(walletResponse.address);
};

const onInfoPressed = async () => { 
  if (info.trim() === "") {
    setStatus(
      <p> {" "} 🦊 {" "} </p>
      );
  }
  setAddress(info);
  getDividendInformation(info,false);
};

const onGetIndexPressed = async () => {  
  if (index.trim() === "") {
    setStatus(
      <p> {" "} 🦊 {" "} </p>
      );
  }
  setIndex(index);
  getDividendInformation(index,true);
};

// UI
return (
  <div id="container">
    <div id="top">
    <span>
        <img id="logo" src={logo}></img>
        <pre> ${symbol} </pre>
      </span>
      <span>{currentTokenPrice} ⇧</span>
      <span>{numberOfDividendTokenHolders} ⇧</span>
      <span>{date}</span>
    </div>

    <PrintGlobalDividends data={ totalDividendsDistributed } />

    <hr/>

    <em className="heading">Dividend Information ➬</em>
    <div id="dividendInformation">
      <PrintAddress data={ accountDividendsInfo[0] } />
      <PrintBalance data={ addressBalance } />
      <PrintDividends data={ fromWei(accountDividendsInfo[3],decimals) } />
      <PrintTotalDividends data={fromWei(accountDividendsInfo[4],decimals) } />
      <PrintIndex data={accountDividendsInfo[1] } />
      <PrintIterationsUntilProcessed data={accountDividendsInfo[2] } />
      <PrintLastProcessedIndex data={lastProcessedIndex } />
      <PrintClaimTime data={ accountDividendsInfo[5] } />
      <PrintSecondsUntilAutoClaimTime data={accountDividendsInfo[6] } />
      <hr/>

      <em className="heading">Search Dividend Information ➬</em>

      <input
      type="text"
      placeholder="enter address here"
      onChange={(e) => setInfo(e.target.value)}
      value={info} />
      <button id="publish" onClick={onInfoPressed}>
      Get Address Information
      </button>

      <em className="heading">Or</em>
      <input
      type="text"
      placeholder="enter index here"
      onChange={(e) => setIndex(e.target.value)}
      value={index} />
      <button id="publish" onClick={onGetIndexPressed}>
      Get Information At Index
      </button>
    </div>
    <hr/>

    <em className="heading">Connect to Dapp ➬</em>
    <div className="center">
      <button id="walletButton" onClick={connectWalletPressed}>
      {walletAddress.length > 0 ? (
        "Connected: " +
        shortenAddress(walletAddress)
        ) : (
        <em>
        Connect Wallet</em>
        )}
        </button>
      </div>
      <p id="status">{status}</p>
      <hr/>
    </div>
    );
};

export default GodlDapp;