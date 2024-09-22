import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default function TransactionDetails() {
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { txHash } = router.query; 

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            if (!txHash) return; 

            const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/4120a176f57d44b79a5f54b1b9cfc9fb'); 
            const txReceipt = await provider.getTransactionReceipt(txHash); 
            const tx = await provider.getTransaction(txHash); 

            // ERC-20 Transfer 이벤트를 확인하기 위한 인터페이스 정의
            const iface = new ethers.Interface([
                "event Transfer(address indexed from, address indexed to, uint256 value)"
            ]);

            // 트랜잭션 로그에서 Transfer 이벤트 파싱
            const transferLog = txReceipt.logs
                .map(log => {
                    try {
                        return iface.parseLog(log); // 로그에서 Transfer 이벤트를 파싱
                    } catch (error) {
                        return null; // Transfer 이벤트가 아닐 경우 무시
                    }
                })
                .filter(log => log !== null); // 유효한 Transfer 이벤트만 필터링

            let tokenAmount = null;

            if (transferLog.length > 0) {
                const { args } = transferLog[0]; // 첫 번째 Transfer 이벤트를 사용
                tokenAmount = ethers.formatUnits(args.value, 18); // 토큰 수량 계산
            }

            const gasUsed = txReceipt.gasUsed;
            const effectiveGasPrice = txReceipt.effectiveGasPrice;
            const totalFee = ethers.formatUnits(gasUsed, 'ether');

            const block = await provider.getBlock(tx.blockNumber); 

            setTransactionDetails({
                amount: ethers.formatUnits(tx.value, 18), // 기본 이더 전송 금액
                recipient: tx.to,
                gasFee: totalFee,
                tokenAmount, // 전송된 토큰 수량
                timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(), 
                nonce: tx.nonce,
                txHash: tx.hash,
            });

            setLoading(false);
        };

        if (txHash) {
            fetchTransactionDetails();
        }
    }, [txHash]);

    if (loading) return <p>Loading...</p>;
    if (!transactionDetails) return <p>No transaction details found</p>; 

    return (
        <div className="transaction-details">
            <h2 className="transaction-title">Outgoing Transaction</h2>
            <div className="transaction-amount">
                <p>{transactionDetails.tokenAmount} Tokens</p> 
                {transactionDetails.tokenAmount && (
                    <p></p> 
                )}
            </div>
            <div className="transaction-info">
                <p><strong>Recipient:</strong> {transactionDetails.recipient}</p>
                <p><strong>Network Fee:</strong> {transactionDetails.gasFee} ETH</p>
                <p><strong>Transaction Time:</strong> {transactionDetails.timestamp}</p>
                <p><strong>Nonce:</strong> {transactionDetails.nonce}</p>
            </div>
            <a className="view-on-sepolia" href={`https://sepolia.etherscan.io/tx/${transactionDetails.txHash}`} target="_blank" rel="noopener noreferrer">
                View on Sepolia
            </a>
        </div>
    );
}
