import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import abi from '../abis/contractAbi.json';
import { ethers } from "ethers";
import { useRouter } from 'next/router'; 

export default function Sent() {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const walletAddress = useSelector((state) => state.wallet.address);
    const signer = useSelector((state) => state.wallet.signer);
    const [balance, setBalance] = useState();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [balChk, setBalChk] = useState(false);
    const [txHash, setTxHash] = useState(null)
    
    const [transactionSuccess, setTransactionSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter(); 

    const getBalance = async () => {
        const contractAddress = '0xE89Ea2b3d4d8e964412E67BfEd4D8Ff6f3F00931';
        const contractAbi = abi;

        try {
            if (!walletAddress || !signer) {
                throw new Error("Wallet address or signer is missing");
            }

            const contract = new ethers.Contract(
                contractAddress,
                contractAbi,
                signer
            );

            const balanceRaw = await contract.balanceOf(walletAddress);
            const formattedBalance = ethers.formatUnits(balanceRaw, 18);
            setBalance(parseFloat(formattedBalance)); 
            setLoading(false);
            setError(null);

        } catch (error) {
            console.error("Error getting balance:", error);
            setError("Failed to load balance");
            setLoading(false);
        }
    };

    const handlePaste = () => {
        navigator.clipboard.readText().then(text => setRecipient(text));
    };

    const handleMax = async () => {
        setAmount(balance);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const contractAddress = '0xE89Ea2b3d4d8e964412E67BfEd4D8Ff6f3F00931';
        const contractAbi = abi;

        try {
            if (!walletAddress || !signer) {
                throw new Error("Wallet address or signer is missing");
            }

            const contract = new ethers.Contract(
                contractAddress,
                contractAbi,
                signer
            );

            const weiAmount = ethers.parseUnits(amount, 18);

            const tx = await contract.transfer(recipient, weiAmount);

            await tx.wait();

            setTransactionSuccess(true);
            setTxHash(tx.hash);
            setShowModal(true);

            await getBalance();

        } catch (error) {
            console.error("Error sending:", error);
            setError("Failed to send");
            setTransactionSuccess(false);
            setShowModal(true);
        }
    };

    
    const handleViewDetails = () => {
        router.push(`/transactionDetails/${txHash}`);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    useEffect(() => {
        if (walletAddress && signer) {
            setLoading(true);
            getBalance();
        }
    }, [walletAddress, signer]);

    useEffect(() => {
        const numericAmount = parseFloat(amount); 
        if (balance >= numericAmount && numericAmount > 0) {
            setBalChk(true); 
        } else {
            setBalChk(false); 
        }
    }, [amount, balance]);

    return (
        <div className="send-bnb-container">
            <h1 className="send-bnb-title">Send</h1>
            <form onSubmit={handleSubmit} className="send-bnb-form">
                <div className="input-container">
                    <input
                        type="text"
                        placeholder="Enter recipient address"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="input-field"
                    />
                    <button type="button" className="input-button" onClick={handlePaste}>
                        Paste
                    </button>
                </div>

                <div className="input-container">
                    <input
                        type="number" 
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input-field"
                    />
                    <button type="button" className="input-button" onClick={handleMax}>
                        Max
                    </button>
                </div>

                <button
                    type="submit"
                    className={`submit-button ${balChk ? 'active' : 'inactive'}`}
                    disabled={!balChk || !recipient} 
                >
                    {balChk ? "Continue" : "잔액이 부족합니다"}
                </button>
            </form>

            {showModal && (
                <div className="modal-backdrop" onClick={closeModal}> 
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}> 
                        {transactionSuccess ? (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="36" 
                                    height="36" 
                                    fill="green" 
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M16 8a8 8 0 1 1-16 0 8 8 0 0 1 16 0zM5.354 7.146a.5.5 0 0 0-.708.708l2.5 2.5a.5.5 0 0 0 .708 0l5-5a.5.5 0 1 0-.708-.708L7.5 9.293 5.354 7.146z"/>
                                </svg>
                                <p>Transaction Submitted</p>
                                <button onClick={handleViewDetails}>View Details</button>
                            </>
                        ) : (
                            <>
                                <p>Transaction Failed</p>
                                <button onClick={closeModal}>Close</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
