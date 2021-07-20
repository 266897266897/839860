require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey); 

const coingeckoEndpoint = "https://api.coingecko.com/api/v3/simple/price?ids=godl&vs_currencies=usd";

export var defaultAddress = "0x1dad736b39462dd297453b31aecf0819c1fd4558";

// https://etherscan.io/address/0x7f509465c38b66bdecec2cfdc842e11809cc8357#code
const contract = require("./godl-abi.json");

// godl contract address
const contractAddress = "0x7f509465c38b66bdecec2cfdc842e11809cc8357";

export const decimals = 18;

export const godlContract = new web3.eth.Contract(contract.abi, contractAddress);

export function fromWei(n, d) { // fromWeiToEth
  return (n / Math.pow(10,d));
}

export function shortenAddress(a) {
    return String(a).substring(0, 6) + "..." + String(a).substring(38);
}

export const getSymbol = async () => { 
  const symbol = await godlContract.methods.symbol().call();
  return symbol;
};

export const getNumberOfDividendTokenHolders = async () => { 
  const n = await godlContract.methods.getNumberOfDividendTokenHolders().call();
  return n;
};

export const getTotalDividendsDistributed = async () => { 
  const dividends = await godlContract.methods.getTotalDividendsDistributed().call();
  const divs = fromWei(dividends,decimals); // 
  return divs;
};

export const getAccountDividendsInfo = async (a) => { 
  if(!a) return;
  const info = await godlContract.methods.getAccountDividendsInfo(a).call();
  return info;
};

export const getAccountDividendsInfoAtIndex = async (i) => { 
  if(!i) return;
  const info = await godlContract.methods.getAccountDividendsInfoAtIndex(i).call();
  return info;
};

export const getLastProcessedIndex = async () => { 
  const index = await godlContract.methods.getLastProcessedIndex().call();
  return index;
};

export const balanceOf = async (a) => { 
  if(!a) return;
  const info = await godlContract.methods.balanceOf(a).call();
  return fromWei(info,decimals);
};

export async function getCurrentTokenPrice() {
  const response = await fetch(coingeckoEndpoint);
  const price = await response.json();
  return price;
}

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "Connected.",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: " " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            {" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
          console.log(addressArray[0]);
        return {
          address: addressArray[0],
          status: "Connected using Metamask.",
        };
      } else {
        return {
          address: "",
          status: " Connect to Metamask using the connect wallet button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: " " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <em>
            {" "}
            {" "}
              You must install <a href="#">Metamask</a> in your
              browser.
        </em>
      ),
    };
  }
};
