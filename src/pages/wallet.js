import { React, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import abi from '../abis/contractAbi.json';
import { ethers } from "ethers";
import { useRouter } from 'next/router';

export default function Wallet() {

    const walletAddress = useSelector((state) => state.wallet.address); 
    const signer = useSelector((state) => state.wallet.signer); 

    const [balance, setBalance] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const router = useRouter();

    const getBalance = async () => {
        const contractAddress = '0xE89Ea2b3d4d8e964412E67BfEd4D8Ff6f3F00931';
        const contractAbi = abi;

        console.log("walletAddress:", walletAddress);
        console.log("signer:", signer);

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

            setBalance(formattedBalance);
            setLoading(false); 
            setError(null); 

        } catch (error) {
            console.error("Error getting balance:", error);
            setError("Failed to load balance"); 
            setLoading(false); 
        }
    };

    const onClickSent = () => {
        router.push('/sent');
    };

    useEffect(() => {
        if (walletAddress && signer) {
            setLoading(true);
            getBalance();
        }
    }, [walletAddress, signer]);

    

    return (
        <div className="balance-card">
            <div className="balance-info">
                <div className="balance-header">
                    <span className="balance-text">Balance</span>
                </div>
                <span className="balance-amount">
                    {loading ? (
                        "Loading..."
                    ) : error ? (
                        <span style={{ color: 'red' }}>{error}</span>
                    ) : (
                        <span className="gradient-text">{balance}</span>
                    )}
                </span>
                <button className="wallet-settings-button"  onClick={onClickSent}>
                    sent
                </button>
            </div>
        </div>
    );
}
