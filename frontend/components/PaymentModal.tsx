import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { OrderResponse, GemOrderResponse } from '@/types/schema';
import axiosClient from '@/lib/axiosClient';
import { Loader2, X, CheckCircle } from 'lucide-react';

type OrderType = OrderResponse | GemOrderResponse;

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderData: OrderType | null;
    onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, orderData, onSuccess }) => {
    const [status, setStatus] = useState<string>('pending');
    const [qrUrl, setQrUrl] = useState<string>('');

    // Helper function to get amount for display
    const getDisplayAmount = (order: OrderType | null): number => {
        if (!order) return 0;
        if ('amount' in order) {
            return order.amount;
        }
        return order.final_amount;
    };

    // Generate SePay QR URL
    const generateSePayQrUrl = (order: OrderType | null): string => {
        if (!order) return '';

        const bankId = process.env.NEXT_PUBLIC_BANK_ID || 'CTG';
        const accountNo = process.env.NEXT_PUBLIC_ACCOUNT_NO || '';
        const amount = getDisplayAmount(order);
        const description = `DH${order.order_id}`;

        const params = new URLSearchParams({
            bank: bankId,
            acc: accountNo,
            template: 'compact',
            amount: amount.toString(),
            des: description,
        });

        return `https://qr.sepay.vn/img?${params.toString()}`;
    };

    useEffect(() => {
        if (isOpen && orderData) {
            setStatus(orderData.status);
            // Generate QR URL từ SePay
            const qrUrl = generateSePayQrUrl(orderData);
            setQrUrl(qrUrl);

            // Polling mechanism
            const interval = setInterval(async () => {
                if (status === 'paid') return;

                try {
                    const res = await axiosClient.get(`/payment/orders/${orderData.order_id}`);
                    const newStatus = res.data.status;
                    if (newStatus === 'paid') {
                        setStatus('paid');
                        toast.success("Thanh toán thành công! Gems đã được cộng vào ví.");
                        clearInterval(interval);
                        setTimeout(() => {
                            onSuccess();
                            onClose();
                        }, 2000);
                    }
                } catch (error) {
                    console.error("Polling error", error);
                }
            }, 3000); // Poll every 3 seconds

            return () => clearInterval(interval);
        }
    }, [isOpen, orderData, status, onSuccess, onClose]);

    if (!isOpen || !orderData) return null;

    const displayAmount = getDisplayAmount(orderData);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-center mb-2 text-indigo-700">Thanh toán VietQR</h2>
                <div className="text-center text-sm text-gray-500 mb-6">Quét mã QR để thanh toán tự động</div>

                {status === 'paid' ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-10">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <CheckCircle size={48} />
                        </div>
                        <p className="text-xl font-bold text-green-700">Đã thanh toán thành công!</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-xl shadow-lg">
                            <div className="bg-white p-2 rounded-lg">
                                {qrUrl && (
                                    <Image
                                        src={qrUrl}
                                        alt="SePay QR Payment"
                                        width={256}
                                        height={256}
                                        className="rounded-md"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="mt-6 w-full space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Nội dung chuyển khoản:</span>
                                <span className="font-mono font-bold text-indigo-600">{orderData.order_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Số tiền:</span>
                                <span className="font-bold text-lg text-green-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayAmount)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center text-sm text-gray-500 space-x-2">
                            <Loader2 className="animate-spin text-indigo-500" size={16} />
                            <span>Đang chờ thanh toán...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
