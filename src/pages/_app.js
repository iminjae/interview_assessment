import { useState, useEffect } from 'react';
import '../styles/globals.css';
import { FaHome, FaWallet } from 'react-icons/fa';
import Link from 'next/link';
import { ethers } from "ethers";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from '../store/store';  
import { setWallet } from '../store/walletSlice'; 

function MyApp({ Component, pageProps }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const dispatch = useDispatch(); 
    const walletAddress = useSelector((state) => state.wallet.address); 
    const signer = useSelector((state) => state.wallet.signer); 


    useEffect(() => {
        const savedAddress = localStorage.getItem('walletAddress');
        if (savedAddress) {
            const restoreWallet = async () => {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                dispatch(setWallet({ address: savedAddress, signer }));
            };
            restoreWallet();
        }
    }, [dispatch]);

    const handleConnectWalletClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const connectMetamask = async () => {
        if (!window.ethereum) return;

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();


            dispatch(setWallet({ address, signer }));

            localStorage.setItem('walletAddress', address);

            setIsModalOpen(false); 

            console.log('Wallet connected: ', address);
        } catch (error) {
            console.error('Error connecting to MetaMask: ', error);
        }
    };

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="logo-container">
                    <img src="/images/logo.png" alt="logo" className="wallet-icon" />
                    <h1>Amando</h1>
                </div>
                <ul>
                    <li>
                        <Link href="/home">
                            <FaHome /> Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/wallet">
                            <FaWallet /> Wallet
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <header className="header">
                    {walletAddress ? (
                      <span className="wallet-address"> 
                        {walletAddress.substring(0, 5)}...{walletAddress.substring(walletAddress.length - 5)}
                      </span>
                    ) : (
                      <button className="connect-wallet" onClick={handleConnectWalletClick}>Connect Wallet</button>
                    )}
                </header>

                <Component {...pageProps} />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Connect to a wallet</h2>
                            <button className="close-btn" onClick={handleCloseModal}>X</button>
                        </div>
                        <ul className="wallet-list">
                            <li className="wallet-item" onClick={connectMetamask}>
                                <img src="/images/metamask.jpeg" alt="Metalogo" className="wallet-icon" />
                                <span>MetaMask</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}


function AppWrapper(props) {
    return (
        <Provider store={store}>
            <MyApp {...props} />
        </Provider>
    );
}

export default AppWrapper;
