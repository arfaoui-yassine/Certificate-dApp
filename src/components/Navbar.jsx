import React, { useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const navigate = useNavigate();

  const switchToGanache = async () => {
    try {
      console.log('Attempting to switch to Ganache network...');
      // Try to switch to Ganache
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }], // 1337 in hex
      });
      console.log('✅ Switched to Ganache network');
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          console.log('Ganache network not found, adding it...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x539', // 1337 in hex
                chainName: 'Ganache Local',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://127.0.0.1:7545'],
                blockExplorerUrls: null,
              },
            ],
          });
          console.log('✅ Ganache network added and switched');
          return true;
        } catch (addError) {
          console.error('❌ Failed to add Ganache network:', addError);
          return false;
        }
      } else {
        console.error('❌ Failed to switch to Ganache network:', switchError);
        return false;
      }
    }
  };

  useEffect(() => {
    const checkAdmin = async (address) => {
      const adminAddress = '0xF3C291D0875873D333ef8F4E18c2AE014eB1e579';
      console.log('Checking admin - Connected address:', address);
      console.log('Checking admin - Admin address:', adminAddress);
      console.log('Checking admin - Match:', address.toLowerCase() === adminAddress.toLowerCase());
      if (address.toLowerCase() === adminAddress.toLowerCase()) {
        setIsAdmin(true);
        console.log('✅ User IS admin');
      } else {
        setIsAdmin(false);
        console.log('❌ User is NOT admin');
      }
    };

    const checkIfWalletIsConnected = async () => {
      console.log('🔍 Checking if wallet is connected...');
      console.log('window.ethereum:', window.ethereum);
      if (window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          console.log('Provider created:', provider);
          
          // Check network
          const network = await provider.getNetwork();
          console.log('🌐 Connected Network:', {
            name: network.name,
            chainId: network.chainId.toString(),
            expectedGanache: '1337'
          });
          
          if (network.chainId.toString() !== '1337') {
            console.warn('⚠️ WARNING: Not connected to Ganache! Expected chainId 1337, got:', network.chainId.toString());
            console.warn('Attempting to switch to Ganache...');
            const switched = await switchToGanache();
            if (!switched) {
              console.error('Failed to switch to Ganache network');
              return;
            }
            // Retry connection after switching
            const newProvider = new BrowserProvider(window.ethereum);
            const newSigner = await newProvider.getSigner();
            const newAddress = await newSigner.getAddress();
            setAccount(newAddress);
            setIsConnected(true);
            await checkAdmin(newAddress);
            return;
          } else {
            console.log('✅ Connected to Ganache network');
          }
          
          const signer = await provider.getSigner();
          console.log('Signer obtained:', signer);
          const signerAddress = await signer.getAddress();
          console.log('Signer address:', signerAddress);
          
          // Check balance
          const balance = await provider.getBalance(signerAddress);
          console.log('Account balance (wei):', balance.toString());
          console.log('Account balance (ETH):', (Number(balance) / 1e18).toFixed(4), 'ETH');
          
          setAccount(signerAddress);
          setIsConnected(true);
          console.log('✅ Wallet connected, checking admin status...');
          await checkAdmin(signerAddress);
        } catch (error) {
          console.error('❌ Error connecting to MetaMask:', error);
        }
      } else {
        console.error('❌ Ethereum wallet is not available (no window.ethereum)');
      }
    };

    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    console.log('🔗 Connect wallet button clicked');
    if (window.ethereum) {
      try {
        console.log('Requesting accounts from MetaMask...');
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new BrowserProvider(window.ethereum);
        
        // Check network
        const network = await provider.getNetwork();
        console.log('🌐 Connected Network:', {
          name: network.name,
          chainId: network.chainId.toString(),
          expectedGanache: '1337'
        });
        
        if (network.chainId.toString() !== '1337') {
          console.warn('⚠️ WARNING: Not connected to Ganache! Expected chainId 1337, got:', network.chainId.toString());
          const switched = await switchToGanache();
          if (!switched) {
            return;
          }
          // Retry connection after switching
          const newProvider = new BrowserProvider(window.ethereum);
          const newSigner = await newProvider.getSigner();
          const newAddress = await newSigner.getAddress();
          setAccount(newAddress);
          setIsConnected(true);
          await checkAdmin(newAddress);
          return;
        }
        
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        console.log('Connected wallet address:', signerAddress);
        
        // Check balance
        const balance = await provider.getBalance(signerAddress);
        console.log('Account balance (ETH):', (Number(balance) / 1e18).toFixed(4), 'ETH');
        
        setAccount(signerAddress);
        setIsConnected(true);
        const adminAddress = '0xF3C291D0875873D333ef8F4E18c2AE014eB1e579';
        console.log('Checking if admin - address:', signerAddress, 'vs', adminAddress);
        if (signerAddress.toLowerCase() === adminAddress.toLowerCase()) {
          setIsAdmin(true);
          console.log('✅ User IS admin - Issue Certificate button should appear');
        } else {
          setIsAdmin(false);
          console.log('❌ User is NOT admin');
        }
      } catch (error) {
        console.error('❌ User rejected the request or another error occurred:', error);
      }
    } else {
      console.error('❌ MetaMask is not installed.');
    }
  };

  console.log('Navbar render - isAdmin:', isAdmin, 'isConnected:', isConnected, 'account:', account);

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-500 shadow-md sm:px-6 lg:px-8">
      <div className="flex items-center">
        <a href="/" className="text-lg font-semibold text-white hover:text-gray-200 transition duration-300">
          Home
        </a>
      </div>

      <div className="flex items-center space-x-4">
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="px-4 py-2 text-white bg-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
          >
            Connect to MetaMask
          </button>
        ) : (
          <span className="px-4 py-2 text-sm text-white bg-gray-800 rounded-md">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        )}

        {console.log('🔍 Rendering admin section - isAdmin:', isAdmin)}
        {isAdmin && (
          <button
            onClick={(e) => {
              console.log('========================================');
              console.log('🎯 BUTTON CLICKED!');
              console.log('Event object:', e);
              console.log('Event target:', e.target);
              console.log('Current isAdmin:', isAdmin);
              console.log('Current isConnected:', isConnected);
              console.log('Current account:', account);
              console.log('About to navigate to: /issuecertificate');
              try {
                navigate('/issuecertificate');
                console.log('✅ Navigate function executed successfully');
              } catch (error) {
                console.error('❌ Navigate function failed:', error);
              }
              console.log('========================================');
            }}
            className="px-4 py-2 text-white bg-green-700 rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300 cursor-pointer"
          >
            Issue Certificate
          </button>
        )}
        {isAdmin && console.log('✅ Issue Certificate button SHOULD be rendered')}
      </div>
    </nav>
  );
};

export default Navbar;
