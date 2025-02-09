import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import React, { useState, useEffect, useRef } from 'react';
interface VehicleSectionProps {
    totalSalary: number;
    onUpdateTotalSalary: (newSalary: number) => void;
    updatedTotalSalary: number;
    onAdjustValueChange: (value: string) => void;
    adjustValue: string;
    onApplyAdjustment: () => void;
}


const VehicleSection: React.FC<VehicleSectionProps> = ({
    totalSalary,
    onUpdateTotalSalary,
    updatedTotalSalary,
    onAdjustValueChange,
    adjustValue,
    onApplyAdjustment,
}) => {
  
   
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [isButtonGreen, setIsButtonGreen] = useState(false); // State to change button color
    const role = sessionStorage.getItem('role');
    const adjustmentApplied = useRef<boolean>(false);
    const uid = sessionStorage.getItem('uid') || '';
    const db = getFirestore();
    const handleApply = () => {
        // Trigger the parent callback to handle the adjustment
        onApplyAdjustment();
    };
   
    const handleAdjustValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        onAdjustValueChange(value);
        if (value) {
            setShowNotification(true); // Show the notification when value is entered
            setIsButtonGreen(false); // Reset button color to default
        } else {
            setShowNotification(false); // Hide notification if input is cleared
        }
    };

    const applyAdjustment = (event?: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent default form behavior if applicable
        if (event) event.preventDefault();

        const adjustedSalary = parseFloat(adjustValue);

        if (adjustedSalary > updatedTotalSalary) {
            // Call the function to update the total salary
            onUpdateTotalSalary(adjustedSalary);
            adjustmentApplied.current = true;
            setIsButtonGreen(true); // Change button color to green
            setShowNotification(false);
        } else {
            // Show confirmation dialog
            const confirmAction = window.confirm('Adjusting salary below the current total. Are you sure?');

            if (confirmAction) {
                // Only show the password prompt depending on the user's role
                const password = role === 'staff' ? prompt('Enter password to apply the adjustment') : prompt('Enter password to apply the adjustment: Password=RSA@123');

                const expectedPassword = role === 'staff' ? 'Adjust' : 'RSA@123';

                if (password === expectedPassword) {
                    // Call the function to update the total salary
                    onUpdateTotalSalary(adjustedSalary);
                    adjustmentApplied.current = true;
                    setIsButtonGreen(true); // Change button color to green
                    setShowNotification(false);
                } else {
                    alert('Incorrect password. Adjustment not applied.');
                }
            } else {
                alert('Adjustment not applied.');
            }
        }
    };
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Call both functions
        applyAdjustment(event); // First, apply the adjustment logic
        handleApply(); // Then, trigger the parent callback to handle additional logic
    };
    return (
        <div className="mb-5">
                
          
                    <div className="flex items-center ml-6">
                        <label style={{ fontSize: '1.5em', color: 'red', marginRight: '10px' }}>Adjustment Value:</label>
                        <input type="text" value={adjustValue} onChange={handleAdjustValueChange} style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }} />
                        <button
                            onClick={handleClick}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '5px',
                                backgroundColor: isButtonGreen ? 'green' : 'red',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                marginLeft: '10px',
                            }}
                        >
                            Apply
                        </button>
                        {showNotification && !isButtonGreen && <span style={{ color: 'red', marginLeft: '10px' }}>Click the apply button</span>}
                    </div>
         
        </div>
    );
};

export default VehicleSection;
// -------------------------------------------------------------------------------------------------------------
