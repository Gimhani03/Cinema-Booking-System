import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Payment.css';

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); 
    
    // 1. SMART INIT: Check if data was passed from the previous page
    const initialData = location.state?.passedBooking || null;

    const [booking, setBooking] = useState(initialData);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState(null);
    
    const [cardDetails, setCardDetails] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    // 2. Fallback Fetch
    useEffect(() => {
        if (booking) return; 

        const fetchBookingDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const PORT = 5001; 
                
                const res = await axios.get(`http://localhost:${PORT}/api/bookings/${bookingId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setBooking(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Could not load details. But you can still try to pay if you know the amount.");
                setLoading(false);
            }
        };
        fetchBookingDetails();
    }, [bookingId, booking]);

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const PORT = 5001; 

            const amountToPay = booking?.totalPrice || 0;

            await axios.post(`http://localhost:${PORT}/api/payments`, {
                bookingId: bookingId,
                amount: amountToPay,
                paymentMethod: 'Credit Card',
                cardLast4: cardDetails.cardNumber.slice(-4)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Payment Successful!');
            
            // --- THIS IS THE FIX ---
            // Redirect to the "Booking Successful" page (Image 2)
            navigate('/booking-success'); 
            
        } catch (err) {
            console.error(err);
            alert('Payment Failed. Check console.');
        }
    };

    if (loading) return <div className="payment-container"><h2 style={{color:'white'}}>Loading Payment Details...</h2></div>;

    return (
        <div className="payment-container">
            <div className="payment-card">
                
                <div className="payment-header">
                    <h2>Secure Checkout</h2>
                    {error && <div className="error-msg">{error}</div>}
                    <p style={{color: '#9ca3af'}}>For: {booking?.movie?.title || "Movie Ticket"}</p>
                </div>

                <div className="amount-box">
                    <span className="label">Total Payable</span>
                    <span className="value">Rs. {booking?.totalPrice || "0.00"}</span>
                </div>

                <form onSubmit={handlePayment}>
                    <div className="form-group">
                        <label>Cardholder Name</label>
                        <input 
                            type="text" required 
                            className="form-input"
                            placeholder="Saman Perera"
                            onChange={e => setCardDetails({...cardDetails, cardName: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Card Number</label>
                        <input 
                            type="text" required maxLength="16"
                            className="form-input"
                            placeholder="0000 0000 0000 0000"
                            onChange={e => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                        />
                    </div>
                    <div className="row">
                        <div className="col form-group">
                            <label>Expiry</label>
                            <input 
                                type="text" required placeholder="MM/YY"
                                className="form-input"
                                onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                            />
                        </div>
                        <div className="col form-group">
                            <label>CVV</label>
                            <input 
                                type="password" required maxLength="3" placeholder="123"
                                className="form-input"
                                onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                            />
                        </div>
                    </div>

                    <button type="submit" className="pay-btn">
                        PAY NOW
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentPage;