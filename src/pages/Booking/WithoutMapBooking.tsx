import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import ReactModal from 'react-modal';
import { v4 as uuid } from 'uuid';
import { query, where } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import VehicleSection from './VehicleSection';
import IconPlus from '../../components/Icon/IconPlus';
import IconMapPin from '../../components/Icon/IconMapPin';
import ShowroomModalWithout from './ShowroomModalWithout';
import styles from './withoutMap.module.css';
import ReactSelect from 'react-select';
import axios from 'axios';
import BaseLocationModal from '../BaseLocation/BaseLocationModal';
interface Showroom {
    value: string;
    label: string;
}
interface Showroom {
    id: string;
    name: string;
    value: string; // Add this property
    insuranceAmountBody: number; // Add this property (use the correct type)
    locationLatLng: {
        lat: number; // Use number type for latitude
        lng: number; // Use number type for longitude
    };
}
interface Driver {
    id: string;
    companyName: string;
    driverName: string;
    [key: string]: any;
}
interface WithoutMapBookingProps {
    activeForm: string;
}
interface DriverLeave {
    driverId: string;
    id: string;
    date: {
        toDate: () => Date;
    };
    leaveDate?: string; // Adjust this property based on your actual structure
}

const driverLeaves: DriverLeave[] = [];

const customStyles = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
        borderRadius: '10px',
        maxWidth: '95%',
        width: '800px',
        maxHeight: '80%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        padding: '30px',
        overflow: 'auto',
        border: 'none',
    },
};
const showrooms: { value: string; label: string }[] = [
    { value: 'lifting', label: 'Lifting' },
    // Add more showroom options here
];
const WithoutMapBooking: React.FC<WithoutMapBookingProps> = ({ activeForm }) => {
    const db = getFirestore();
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState<string>('');

    useEffect(() => {
        const newBookingId = uuid().substring(0, 6);
        setBookingId(newBookingId);
    }, []);
    const [updatedTotalSalary, setUpdatedTotalSalary] = useState<number>(0);
    const [companies, setCompanies] = useState<Driver[]>([]);
    const [totalDriverDistance, setTotalDriverDistance] = useState<string>('');
    const [receivedAmount, setReceivedAmount] = useState<number>(0);
    const [receivedAmountCompany, setReceivedAmountCompany] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const { state } = useLocation();
    const [isModalOpen1, setIsModalOpen1] = useState<boolean>(false);
    const openModal1 = () => setIsModalOpen1(true);
    const closeModal1 = () => setIsModalOpen1(false);
    const [comments, setComments] = useState<string>('');
    const [fileNumber, setFileNumber] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [vehicleType, setVehicleType] = useState<string>('');
    const [totalDriverSalary, setTotalDriverSalary] = useState<number>(0);
    const [serviceCategory, setServiceCategory] = useState<string>('');
    const [company, setCompany] = useState<string>('');
    const [customerName, setCustomerName] = useState<string>('');
    const [mobileNumber, setMobileNumber] = useState<string>('');
    const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
    const [vehicleNumber, setVehicleNumber] = useState<string>('');
    const [vehicleModel, setVehicleModel] = useState<string>('');
    const [vehicleSection, setVehicleSection] = useState<string>('');
    const [showShowroomModal, setShowShowroomModal] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
    const [serviceDetails, setServiceDetails] = useState<any>('');
    const [serviceType, setServiceType] = useState<string>('');
    const [pickupLocation, setPickupLocation] = useState<{ lat: string; lng: string; name: string }>({ lat: '', lng: '', name: '' });
    const [availableServices, setAvailableServices] = useState<string>('');
    const [dropoffLocation, setDropoffLocation] = useState<{ lat: string; lng: string; name: string } | null>(null);
    const [deliveryDateTime, setDeliveryDateTime] = useState<string>('');
    const [baseLocation, setBaseLocation] = useState<{ lat: string; lng: string; name: string } | null>(null);
    const [selectedCompanyData, setSelectedCompanyData] = useState<Driver | null>(null);
    const [trappedLocation, setTrappedLocation] = useState<string>('');
    const [totalSalary, setTotalSalary] = useState<number>(0);
    const [showroomLocation, setShowroomLocation] = useState<string>('');
    const [insuranceAmountBody, setInsuranceAmountBody] = useState<number | string>(''); // Adjust type to allow both number and string
    const [showrooms, setShowrooms] = useState<Showroom[]>([]);
    const [distance, setDistance] = useState<string>('');
    const [drivers, setDrivers] = useState<any[]>([]);
    const [editData, setEditData] = useState<any>(null);
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);
    const [showRooms, setShowRooms] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string>(''); // or any default value
    const [currentDateTime, setCurrentDateTime] = useState<string>('');
    const [manualInput, setManualInput] = useState<string>('');
    const [manualInput1, setManualInput1] = useState<string>(dropoffLocation ? dropoffLocation.name : '');
    const [disableFields, setDisableFields] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>({});
    const [adjustValue, setAdjustValue] = useState<string>('');
    const [bodyShope, setBodyShope] = useState<string>('');
    const [isAdjustmentApplied, setIsAdjustmentApplied] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // To track if we're in edit mode
    const [confirmUpdatedTotalSalary, setConfirmUpdatedTotalSalary] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

// -----------------------------------------------------------------------------------------------------------------------------------------------
const [driverLeaves, setDriverLeaves] = useState<DriverLeave[]>([]);

const uid = sessionStorage.getItem('uid');
    const userName = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('role');

    useEffect(() => {
        if (state && state.editData) {
            const editData = state.editData;
            setEditData(editData);
            setBookingId(editData.bookingId || '');
            setTrappedLocation(editData.trappedLocation || '');
            setConfirmUpdatedTotalSalary(editData.confirmUpdatedTotalSalary || '');
            setBodyShope(editData.bodyShope || '');
            setComments(editData.comments || '');
            setFileNumber(editData.fileNumber || '');
            setCompany(editData.company || '');
            setTotalDriverSalary(editData.totalDriverSalary || 0);
            setTotalDriverDistance(editData.totalDriverDistance || 0);
            setCustomerName(editData.customerName || '');
            setPhoneNumber(editData.phoneNumber || '');
            setVehicleType(editData.vehicleType || '');
            setServiceCategory(editData.serviceCategory || '');
            setAvailableServices(editData.availableServices || '');
            setMobileNumber(editData.mobileNumber || '');
            setVehicleNumber(editData.vehicleNumber || '');
            setVehicleModel(editData.vehicleModel || '');
            setVehicleSection(editData.vehicleSection || '');
            setShowroomLocation(editData.showroomLocation || '');
            setDistance(editData.distance || '');
            setSelectedDriver(editData.selectedDriver || '');
            setBaseLocation(editData.baseLocation || null);
            setPickupLocation(editData.pickupLocation || { lat: '', lng: '', name: '' });
            setUpdatedTotalSalary(editData.updatedTotalSalary || 0);
            setServiceType(editData.serviceType || '');
            setAdjustValue(editData.adjustValue || '');
            setTotalSalary(editData.totalSalary || 0);
            setDropoffLocation(editData.dropoffLocation || null);
            setSelectedCompany(editData.selectedCompany || '');
            setInsuranceAmountBody(editData.insuranceAmountBody || '');
            console.log('editData.insuranceAmountBody', editData.insuranceAmountBody);

            setDisableFields(false);

            setIsEditing(true); // Mark as editing
        } else {
            setIsEditing(false); // If no edit data, it's a new entry
        }
    }, [state]);

    useEffect(() => {
        const formatDate = (date: Date) => {
            const options: Intl.DateTimeFormatOptions = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true, // This is fine, as it's a boolean
            };
            return new Intl.DateTimeFormat('en-GB', options).format(date);
        };

        const updateDateTime = () => {
            const now = new Date();
            const formattedDateTime = formatDate(now);
            setCurrentDateTime(formattedDateTime);
        };

        // Update date and time immediately on mount
        updateDateTime();

        // Set up interval to update every second
        const intervalId = setInterval(updateDateTime, 1000);

        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, []);
    const fetchDriverLeaves = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remove time component
        const todayTimestamp = today.getTime();
    
        const leavesRef = collection(db, `user/${uid}/DriverLeaves`);
        const snapshot = await getDocs(leavesRef);
        const leaveData: DriverLeave[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                driverId: data.driverId || '', // Ensure `driverId` exists
                date: data.date, // Ensure `date` exists and is a Firestore timestamp
            };
        });
    
        const filteredLeaves = leaveData.filter((leave) => {
            const leaveDate = leave.date.toDate(); // Convert Firestore timestamp to Date
            leaveDate.setHours(0, 0, 0, 0); // Remove time component
            return leaveDate.getTime() === todayTimestamp;
        });
    
        setDriverLeaves(filteredLeaves); // Now this works with the correct type
    };
    
    useEffect(() => {
        fetchDriverLeaves();
    }, []);
    useEffect(() => {
        setManualInput(pickupLocation.name || '');
    }, [pickupLocation]);
    useEffect(() => {
        if (trappedLocation === 'outsideOfRoad') {
            setDisableFields(true);
        } else {
            setDisableFields(false);
        }
    }, [trappedLocation]);
    const validateForm = () => {
        let tempErrors: { [key: string]: string } = {}; // Allows string keys
        let isValid = true;

        // Phone number validation
        if (!phoneNumber.trim()) {
            tempErrors['phoneNumber'] = 'Phone number is required';
            isValid = false;
        } else if (!/^\d{10}$/.test(phoneNumber)) {
            tempErrors['phoneNumber'] = 'Phone number is invalid, must be 10 digits';
            isValid = false;
        }
        if (!baseLocation) {
            tempErrors['baseLocation'] = 'BaseLocation is required';
            isValid = false;
        }
      
        if (!distance) {
            tempErrors['distance'] = 'distance is required';
            isValid = false;
        }
        if (!serviceType) {
            tempErrors['serviceType'] = 'serviceType is required';
            isValid = false;
        }
        if (!vehicleNumber) {
            tempErrors['vehicleNumber'] = 'vehicleNumber is required';
            isValid = false;
        }
        if (!totalDriverDistance) {
            tempErrors['totalDriverDistance'] = 'totalDriverDistance is required';
            isValid = false;
        }
        if (!vehicleType) {
            tempErrors['vehicleType'] = 'vehicleType is required';
            isValid = false;
        }
        // Trapped location validation
        if (!trappedLocation) {
            tempErrors['trappedLocation'] = 'Trapped location is required';
            isValid = false;
        } else if (trappedLocation === 'outsideOfRoad' && (!updatedTotalSalary || updatedTotalSalary <= 0)) {
            tempErrors['updatedTotalSalary'] = 'Updated Total Salary is required and must be greater than 0 when Trapped Location is "Outside of Road"';
            isValid = false;
        }
        if (!isEditing && adjustValue && !isAdjustmentApplied) {
            tempErrors['applyAdjustment'] = 'You must click the Apply button';
            isValid = false;
        }
       if (!fileNumber.trim()) {
                tempErrors['fileNumber'] = 'File number is required for rsa work';
                isValid = false;
            } else if (!fileNumber.trim()) {
                tempErrors['fileNumber'] = 'File number is required for payment work';
                isValid = false;
            }
        
 // Pickup location validation
 if (!pickupLocation.lat) {
    tempErrors['pickupLocationLat'] = 'Latitude and ';
    isValid = false;
}
if (!pickupLocation.lng) {
    tempErrors['pickupLocationLng'] = 'Longitude are required and must be a valid number';
    isValid = false;
}
        setErrors(tempErrors);
        return isValid;
    };
    // ------------------------------------------
    useEffect(() => {
        if (company === 'rsa') {
            const fetchDrivers = async () => {
                try {
                    const driverCollection = collection(db, `user/${uid}/driver`);
                    const q = query(driverCollection, where('companyName', '==', 'Company'));
                    const querySnapshot = await getDocs(q);
                    const fetchedDrivers = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Driver[];
                    setCompanies(fetchedDrivers);
                } catch (error) {
                    console.error('Error fetching drivers:', error);
                }
            };
            fetchDrivers();
        }
    }, [company, db, uid]);

    const handleUpdateTotalSalary = (newTotaSalary: any) => {
        setUpdatedTotalSalary(newTotaSalary);
    };
    const handleApplyAdjustment = () => {
        setIsAdjustmentApplied(true);
        // Call any other logic you need for applying the adjustment
    };
  
    const handleConfirm = () => {
        setIsButtonClicked(true); // Mark the button as clicked
        setErrorMessage('');
        if (Number(confirmUpdatedTotalSalary) !== updatedTotalSalary) {
            setShowModal(true); // Show modal if values do not match
        } else {
            setUpdatedTotalSalary(Number(confirmUpdatedTotalSalary));
            setShowModal(false); // Close modal if opened
        }
    };

    const closeModalU = () => {
        setShowModal(false); // Close modal on button click
    };

    const handleAdjustValueChange = (newAdjustValue: any) => {
        setAdjustValue(newAdjustValue);
        setIsAdjustmentApplied(false);
    };
   

    useEffect(() => {
      
        if (selectedCompany) {
            // Find the company details corresponding to the selected company
            const foundCompanyData = companies.find((company) => company.id === selectedCompany); // Update this to match your company data structure

            if (foundCompanyData) {
                setSelectedCompanyData(foundCompanyData);
            } else {
                console.warn('No matching company found for selectedCompany');
                setSelectedCompanyData(null);
            }
        } else {
            console.warn('No selectedCompany');
            setSelectedCompanyData(null);
        }
    }, [selectedCompany, companies]); // Use 'companies' instead of 'drivers'

    const handleInputChange = (field: any, value: any) => {
        switch (field) {
            case 'showroomLocation':
                setShowroomLocation(value);

                const selectedShowroom: any = showrooms.find((show: any) => show.value === value);

                if (selectedShowroom) {
                    setInsuranceAmountBody(selectedShowroom.insuranceAmountBody);

                    // Check if selectedShowroom has locationLatLng before accessing lat and lng
                    if (selectedShowroom.locationLatLng && selectedShowroom.locationLatLng.lat && selectedShowroom.locationLatLng.lng) {
                        const latString = selectedShowroom.locationLatLng.lat.toString();
                        const lngString = selectedShowroom.locationLatLng.lng.toString();

                        setDropoffLocation({
                            name: selectedShowroom.value,
                            lat: latString,
                            lng: lngString,
                        });
                    } else {
                        console.error('Location data is missing for the selected showroom.');
                        // You may choose to set a default or empty location here
                        setDropoffLocation({
                            name: selectedShowroom.value || '',

                            lat: '',
                            lng: '',
                        });
                    }
                } else {
                    setInsuranceAmountBody(0);
                    setDropoffLocation({
                        name: '',
                        lat: '',
                        lng: '',
                    });
                }
                break;
            case 'totalSalary':
                setTotalSalary(value || 0);
                break;
            case 'serviceCategory':
                setServiceCategory(value || 0);

                break;
            case 'availableServices':
                setAvailableServices(value || 0);

                break;
            case 'bodyShope':
                setBodyShope(value || '');
                break;
            case 'insuranceAmountBody':
                setInsuranceAmountBody(value || 0);
                break;
            case 'adjustValue':
                setAdjustValue(value || 0);

                break;
                case 'confirmUpdatedTotalSalary':
                    setConfirmUpdatedTotalSalary(value || 0);
                    break;
            case 'customerName':
                setCustomerName(value || '');
                break;
            case 'totalDriverDistance':
                setTotalDriverDistance(value || 0);
                break;
            case 'totalDriverSalary':
                setTotalDriverSalary(value || 0);
                break;

                case 'company':
                    setCompany(value);
                    setFileNumber(value === 'self' ? bookingId : '');
                    if (isEditing) {
                        if (value === 'rsa') {
                            setSelectedDriver(''); // Reset selectedDriver when company is 'rsa'
                        }
                        if (value === 'self') {
                            setSelectedDriver('');
                            setSelectedCompany('');
    
                            setSelectedCompany('');
                            setIsModalOpen(true);
                        }
                    }
                    break;

            case 'fileNumber':
                setFileNumber(value || '');
                break;

            case 'companies':
                setCompanies(value || '');
                break;
            case 'bookingId':
                setBookingId(value || '');
                break;
            case 'comments':
                setComments(value || '');
                break;
            case 'vehicleNumber':
                setVehicleNumber(value || '');
                break;

            case 'updatedTotalSalary':
                setUpdatedTotalSalary(value || '');
                break;

                case 'distance':
                    const newDistance = value || 0; // Default to 0 if totalDistance is NaN
                    setDistance(newDistance);
    
                    if (isEditing) {
                        const selectedDriverData = drivers.find((driver) => driver.id === selectedDriver);
    
                        if (!selectedDriverData) {
                            console.error('Driver data is missing. Cannot calculate salary.');
                            return;
                        }
    
                        const isRSA = selectedDriverData.companyName !== 'Company';
    
                        // Declare variables for salary calculation
                        let salary;
                        let basicSalaryKM;
                        let salaryPerKM;
                        let selectedService;
    
                        if (selectedCompanyData) {
                            if (selectedCompanyData.basicSalaries && selectedCompanyData.selectedServices && selectedCompanyData.basicSalaryKm && selectedCompanyData.salaryPerKm) {
                                // Filter only the selected serviceType from the selectedServices array
                                selectedService = selectedCompanyData.selectedServices.find((service: string) => service === serviceType);
    
                                setSelectedServiceType(selectedService);
                                console.log('Selected Service Type:', selectedService);
    
                                // Use the selected service type to retrieve values
                                salary = selectedCompanyData.basicSalaries[selectedService];
                                basicSalaryKM = selectedCompanyData.basicSalaryKm[selectedService];
                                salaryPerKM = selectedCompanyData.salaryPerKm[selectedService];
                            } else {
                                console.error('Missing properties in selectedCompanyData');
                                return;
                            }
                        } else if (isRSA) {
                            // Fallback for RSA scenario or when selectedCompanyData is unavailable
                            selectedService = selectedDriverData.selectedServices.find((service: string) => service === serviceType);
    
                            salary = isRSA ? serviceDetails.salary : selectedDriverData.basicSalaries[selectedService];
                            basicSalaryKM = isRSA ? serviceDetails.basicSalaryKM : selectedDriverData.basicSalaryKm[selectedService];
                            salaryPerKM = isRSA ? serviceDetails.salaryPerKM : selectedDriverData.salaryPerKm[selectedService];
                        }
    
                        if (!selectedService) {
                            console.error(`No matching service type found for driver ${selectedDriverData.id} and serviceType ${serviceType}`);
                            setTotalSalary(0);
                            return;
                        }
    
                        if (calculateTotalSalary) {
                            console.log(`Calculating total salary for driver ${selectedDriverData.id} with values:`, {
                                salary,
                                newDistance,
                                basicSalaryKM,
                                salaryPerKM,
                                isRSA,
                            });
    
                            const calculatedSalary = calculateTotalSalary(salary, newDistance, basicSalaryKM, salaryPerKM, isRSA);
    
                            console.log(`Driver ${selectedDriverData.id} - Calculated Salary: ${calculatedSalary}`);
                            setTotalSalary(parseFloat(calculatedSalary.toFixed(2)));
                        }
                    }
                    break;
           
            case 'selectedDriver':
                setSelectedDriver(value || '');

                const selectedDriverData = drivers.find((driver) => driver.id === value);
                if (selectedDriverData) {
                    const isRSA = selectedDriverData.companyName !== 'Company';

                    // Define the selected service type
                    const selectedService = isRSA
                        ? serviceType // Use the global serviceType if the company is RSA
                        : selectedDriverData.selectedServices.find((service: string) => service === serviceType); // Find the matching serviceType in the driver's selected services

                    // If no serviceType matches, log an error or handle fallback
                    if (!selectedService) {
                        console.error(`No matching service type found for driver ${selectedDriverData.id} and serviceType ${serviceType}`);
                        setTotalSalary(0);
                        return;
                    }

                    // Fetch salary details based on selectedService
                    const salary =
                        isRSA && selectedCompanyData
                            ? selectedCompanyData.basicSalaries[selectedService] // RSA company salary
                            : !isRSA
                            ? selectedDriverData.basicSalaries[selectedService] // Non-RSA driver salary
                            : serviceDetails.salary;

                    const basicSalaryKM =
                        isRSA && selectedCompanyData ? selectedCompanyData.basicSalaryKm[selectedService] : !isRSA ? selectedDriverData.basicSalaryKm[selectedService] : serviceDetails.basicSalaryKM;

                    const salaryPerKM =
                        isRSA && selectedCompanyData ? selectedCompanyData.salaryPerKm[selectedService] : !isRSA ? selectedDriverData.salaryPerKm[selectedService] : serviceDetails.salaryPerKM;

                    // Log all the salary details for debugging
                    console.log('Salary Details:', {
                        salary,
                        basicSalaryKM,
                        salaryPerKM,
                        serviceType: selectedService,
                    });

                    // Calculate the total salary
                    const calculatedSalary = calculateTotalSalary(salary, distance, basicSalaryKM, salaryPerKM, isRSA);

                    // Set the total salary
                    setTotalSalary(parseFloat(calculatedSalary.toFixed(2)));
                } else {
                    setTotalSalary(0);
                    console.log('No driver data found. Total Salary set to 0');
                }
                break;

            // case 'company':
            //     setCompany(value);
            //     if (value === 'rsa') {
            //         setSelectedDriver('');
            //     }
            //     break;

            case 'selectedCompany':
                setSelectedCompany(value);
                if (isEditing) {
                    setIsModalOpen(true);
                }
                break;

            case 'dropoffLocation':
                if (typeof value === 'number' || typeof value === 'string') {
                    setDropoffLocation({
                        ...dropoffLocation,
                        ...dropoffLocation,
                        name: String(value), // Ensure name is a string
                        lat: dropoffLocation?.lat || '', // Ensure lat is a string
                        lng: dropoffLocation?.lng || '',
                    });
                } else {
                    // setDropoffLocation({ ...dropoffLocation, name: value.name });
                    setDropoffLocation({
                        ...dropoffLocation,
                        name: value.name ? String(value.name) : '', // Ensure it's a string
                        lat: value.lat ? String(value.lat) : '', // Provide default '' if undefined
                        lng: value.lng ? String(value.lng) : '', // Provide default '' if undefined
                    });
                }
                break;
            case 'mobileNumber':
                setMobileNumber(value || '');
                break;
            case 'phoneNumber':
                setPhoneNumber(value || '');
                break;
            case 'vehicleType':
                setVehicleType(value || '');
                break;

            case 'pickupLocation':
                if (typeof value === 'string') {
                    setPickupLocation({ ...pickupLocation, name: value });
                } else {
                    setPickupLocation({ ...pickupLocation, name: value.name });
                }
                break;

            case 'vehicleSection':
                setVehicleSection(value || '');
                break;
            case 'vehicleModel':
                setVehicleModel(value || '');
                break;
            case 'baseLocation':
                setBaseLocation(value || '');
                break;

            case 'trappedLocation':
                setDisableFields(value === 'outsideOfRoad'); // Disable fields if trappedLocation is 'outsideOfRoad'

                setTrappedLocation(value || '');
                break;

            case 'showrooms':
                setShowrooms(value || '');
                break;
            default:
                break;
        }

        if (field === 'serviceType') {
            setServiceType(value || '');
            openModal(distance);
        } else if (field === 'selectedDriver') {
            setSelectedDriver(value || '');
        }
    };

    const selectedDriverData = drivers.find((driver) => driver.id === selectedDriver);
    const openModal = (distance: any) => {
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };
    useEffect(() => {
        const db = getFirestore();
        const serviceCollection = collection(db, `user/${uid}/showroom`);

        // Set up the real-time listener
        const unsubscribe = onSnapshot(
            serviceCollection,
            (snapshot) => {
                const servicesList = snapshot.docs.map((doc) => ({
                    value: doc.data().Location, // Keep this if Location is used as the value for selecting an option
                    label: doc.data().ShowRoom, // ShowRoom will be displayed as the label in the dropdown
                    insuranceAmountBody: doc.data().insuranceAmountBody, // Include this field if needed
                    locationLatLng: doc.data().locationLatLng, // Include this field if needed
                }));
                setShowrooms(servicesList as any);
            },
            (error) => {
                console.error('Error fetching services:', error);
            }
        );

        // Clean up the listener on component unmount
        return () => unsubscribe();
    }, [uid]);

    //-------------------------------------------------------------------------------------
    useEffect(() => {
        setManualInput1(dropoffLocation ? dropoffLocation.name : '');
    }, [dropoffLocation]);

    const handleManualChange1 = (field: any, value: any) => {
        setDropoffLocation((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleLocationChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setManualInput1(value);
        handleInputChange('dropoffLocation', value);
    };
    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setManualInput(value);

        // Update pickupLocation with lat/lng values
        const [lat, lng] = value.split(',').map((coord) => coord.trim());

        setPickupLocation((prevState) => ({
            ...prevState,
            lat: lat || prevState.lat,
            lng: lng || prevState.lng,
            name: value,
        }));
    };

    const updateShowroomLocation = (location: string) => {
        setShowroomLocation(location);
    };
    const handleManualChange = (field: any, value: any) => {
        setPickupLocation((prev) => ({ ...prev, [field]: value }));
    };
    useEffect(() => {
        const fetchServiceTypes = async () => {
            try {
                const serviceCollection = collection(db, `user/${uid}/service`);
                const snapshot = await getDocs(serviceCollection);
                const services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setServiceTypes(services);
            } catch (error) {
                console.error('Error fetching service types:', error);
            }
        };

        fetchServiceTypes();
    }, [db]);

    useEffect(() => {
        const db = getFirestore();
        const unsubscribe = onSnapshot(collection(db, `user/${uid}/showroom`), (snapshot) => {
            const Location = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setShowRooms(Location);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchDrivers = async () => {
            if (!serviceType || !serviceDetails || !pickupLocation) {
                setDrivers([]);
                return;
            }

            try {
                const driversCollection = collection(db, `user/${uid}/driver`);
                const snapshot = await getDocs(driversCollection);


                const filteredDrivers = await Promise.all(
                    snapshot.docs.map(async (doc) => {
                        const driverData = doc.data();
                        const { currentLocation, selectedServices, status } = driverData;

                        // Log current driver data

                        // Filter out drivers that don't match the criteria
                        if (!selectedServices || !selectedServices.includes(serviceType) || status === 'deleted from UI') {
                            return null;
                        }

                        const currentLat = currentLocation?.latitude ?? null;
                        const currentLng = currentLocation?.longitude ?? null;

                        // Log the current driver's location

                        if (typeof currentLat === 'number' && typeof currentLng === 'number' && pickupLocation.lat && pickupLocation.lng) {
                        } else {
                            console.error(`Invalid location data for driver ${doc.id}:`, { currentLat, currentLng });
                            return null; // Skip this driver
                        }

                        try {
                            // Log the API request details
                            console.log(`Requesting distance for driver ${doc.id}`, {
                                origin: `${currentLat},${currentLng}`,
                                destination: `${pickupLocation.lat},${pickupLocation.lng}`,
                                apiKey: import.meta.env.VITE_REACT_APP_API_KEY,
                            });

                            const response = await axios.post('https://api.olamaps.io/routing/v1/directions', null, {
                                params: {
                                    origin: `${currentLat},${currentLng}`,
                                    destination: `${pickupLocation.lat},${pickupLocation.lng}`,
                                    api_key: import.meta.env.VITE_REACT_APP_API_KEY,
                                },
                                headers: {
                                    'X-Request-Id': `${doc.id}-${Date.now()}`,
                                },
                            });

                            // Log the API response to inspect the structure
                            console.log(`API Response for driver ${doc.id}:`, response.data);

                            const routes = response.data.routes;
                            let distance = 'Distance not available';

                            if (routes?.length > 0) {
                                console.log(`Routes for driver ${doc.id}:`, routes); // Log routes to inspect its structure

                                if (routes[0]?.legs?.length > 0 && routes[0].legs[0]?.readable_distance) {
                                    distance = routes[0].legs[0].readable_distance; // Use readable_distance
                                    console.log(`Driver ${doc.id} pickup distance: ${distance}`);
                                } else {
                                    console.error(`No valid leg data found in the response for driver ${doc.id}`);
                                }
                            } else {
                                console.error(`No valid routes found in the response for driver ${doc.id}`);
                            }

                            return {
                                id: doc.id,
                                ...driverData,
                                currentLocation: { lat: currentLat, lng: currentLng },
                                pickupDistance: distance, // Store the calculated distance
                            };
                        } catch (error) {
                            // Handle any errors in fetching the distance
                            console.error(`Error fetching distance for driver ${doc.id}:`, error);
                            return {
                                id: doc.id,
                                ...driverData,
                                currentLocation: { lat: currentLat, lng: currentLng },
                                pickupDistance: 'Error fetching distance',
                            };
                        }
                    })
                );

                console.log('Filtered drivers list:', filteredDrivers);
                setDrivers(filteredDrivers.filter(Boolean)); // Remove null entries
            } catch (error) {
                // Log any errors that occur while fetching drivers
                console.error('Error fetching drivers:', error);
            }
        };

        if (serviceType && serviceDetails && pickupLocation) {
            console.log('Criteria met: Fetching drivers');
            fetchDrivers().catch(console.error); // Initiate fetching drivers if all criteria are met
        } else {
            console.log('Criteria not met: Resetting drivers list');
            setDrivers([]); // Reset the drivers list if necessary criteria are missing
        }
    }, [db, uid, serviceType, serviceDetails, pickupLocation]);

    const calculateTotalSalary = (salary: any, totalDistance: any, basicSalaryKM: any, salaryPerKM: any, isRSA: any) => {
        const numericBasicSalary = Number(salary) || 0;
        const numericTotalDistance = Number(totalDistance) || 0;
        const numericKmValueNumeric = Number(basicSalaryKM) || 0;
        const numericPerKmValueNumeric = Number(salaryPerKM) || 0;
        if (isRSA) {
            // For RSA company
            if (numericTotalDistance > numericKmValueNumeric) {
                return numericBasicSalary + (numericTotalDistance - numericKmValueNumeric) * numericPerKmValueNumeric;
            } else {
                return numericBasicSalary;
            }
        } else {
            // For non-RSA companies
            if (numericTotalDistance > numericKmValueNumeric) {
                return numericBasicSalary + (numericTotalDistance - numericKmValueNumeric) * numericPerKmValueNumeric;
            } else {
                return numericBasicSalary;
            }
        }
    };
    // Fetch service details based on selected serviceType
    useEffect(() => {
        const fetchServiceDetails = async () => {
            if (!serviceType) {
                setServiceDetails({});
                setSelectedServiceType(null);
                return;
            }

            try {
                // Query to get the service details for the specific serviceType
                const serviceQuery = query(collection(db, `user/${uid}/service`), where('name', '==', serviceType)); // Filtering for the selected serviceType
                const snapshot = await getDocs(serviceQuery);
                if (snapshot.empty) {
                    setServiceDetails({});
                    setSelectedServiceType(null);
                    return;
                }

                // Get the first document that matches the serviceType
                const details = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0];
                console.log('Fetched Service Details for selected serviceType:', details);
                setServiceDetails(details);
                setSelectedServiceType(serviceType);
            } catch (error) {
                console.error('Error fetching service details:', error);
                setServiceDetails({});
                setSelectedServiceType(null);
            }
        };

        fetchServiceDetails();
    }, [db, serviceType, uid]);

    // Calculate total salary based on filtered serviceDetails
    useEffect(() => {
        if (drivers.length > 0) {
            const totalSalaries = drivers.map((driver) => {
                const isRSA = driver.companyName !== 'Company';

                // Declare variables for salary calculation
                let salary;
                let basicSalaryKM;
                let salaryPerKM;
                let selectedService;

                if (selectedCompanyData) {
                    if (selectedCompanyData.basicSalaries && selectedCompanyData.selectedServices && selectedCompanyData.basicSalaryKm && selectedCompanyData.salaryPerKm) {
                        // Filter only the selected serviceType from the selectedServices array
                        selectedService = selectedCompanyData.selectedServices.find((service: any) => service === serviceType);

                        setSelectedServiceType(selectedService);
                        console.log('Selected Service Typeee:', selectedService);

                        // Now use this selected service type to calculate the salary
                        salary = selectedCompanyData.basicSalaries[selectedService];
                        basicSalaryKM = selectedCompanyData.basicSalaryKm[selectedService];
                        salaryPerKM = selectedCompanyData.salaryPerKm[selectedService];

                    } else {
                        console.error('Missing properties in selectedCompanyData');
                    }
                } else if (isRSA) {
                    // Fallback for RSA scenario or when selectedCompanyData is unavailable
                    selectedService = driver.selectedServices.find((service: any) => service === serviceType);

                    salary = isRSA ? serviceDetails.salary : driver.basicSalaries[selectedService];
                    basicSalaryKM = isRSA ? serviceDetails.basicSalaryKM : driver.basicSalaryKm[selectedService];
                    salaryPerKM = isRSA ? serviceDetails.salaryPerKM : driver.salaryPerKm[selectedService];

                }

                // Calculate the total salary if calculateTotalSalary is available
                if (calculateTotalSalary) {
                    console.log(`Calculating total salary for driver ${driver.id} with values:`, {
                        salary,
                        distance,
                        basicSalaryKM,
                        salaryPerKM,
                        isRSA,
                    });

                    const calculatedSalary = calculateTotalSalary(salary, distance, basicSalaryKM, salaryPerKM, isRSA);

                    console.log(`Driver ${driver.id} - Calculated Salary: ${calculatedSalary}`);
                    return calculatedSalary;
                } else {
                    console.error('calculateTotalSalary function is not available');
                    return 0;
                }
            });

            // Do something with totalSalaries (like setting state or logging it)
            console.log('Total Salaries for Drivers:', totalSalaries);
        }
    }, [distance, selectedCompany, selectedDriver, drivers, serviceDetails, selectedCompanyData, calculateTotalSalary]);

    const calculateTotalDriverSalary = (totalDriverDistance: any, basicSalaryKM: any, salaryPerKM: any, salary: any) => {
        totalDriverDistance = parseFloat(totalDriverDistance);
        basicSalaryKM = parseFloat(basicSalaryKM);
        salaryPerKM = parseFloat(salaryPerKM);
        salary = parseFloat(salary);
       
        if (totalDriverDistance > basicSalaryKM) {
            return salary + (totalDriverDistance - basicSalaryKM) * salaryPerKM;
        } else {
            return salary;
        }
    };

    useEffect(() => {
        if (selectedDriver && Array.isArray(drivers)) {
            const selectedDriverData = drivers.find((driver) => driver.id === selectedDriver);
            console.log('selectedDriverData', selectedDriverData);
            if (selectedDriverData) {
                // Access the nested properties
                const { basicSalaryKm, salaryPerKm, basicSalaries } = selectedDriverData;

                if (!basicSalaryKm || !salaryPerKm || !basicSalaries) {
                    console.error('Selected driver does not have all required properties:', selectedDriverData);
                    return;
                }

                if (selectedServiceType) {
                    // Now that we know selectedServiceType is not null, use it as an index
                    const basicSalaryKM = basicSalaryKm[selectedServiceType];
                    const salaryPerKM = salaryPerKm[selectedServiceType];
                    const salary = basicSalaries[selectedServiceType];
                    console.log('selectedServiceType', selectedServiceType);

                    if (basicSalaryKM === undefined || salaryPerKM === undefined || salary === undefined) {
                        console.error('Selected service does not have all required properties:', {
                            basicSalaryKM,
                            salaryPerKM,
                            salary,
                        });
                        return;
                    }

                    if (totalDriverDistance < basicSalaryKM) {
                        setTotalDriverSalary(salary); // If distance is less than basicSalaryKM, return the base salary
                    }
                    const calculatedSalary = calculateTotalDriverSalary(totalDriverDistance, basicSalaryKM, salaryPerKM, salary);
                    setTotalDriverSalary(calculatedSalary);
                } else {
                    console.error('No selectedServiceType provided.');
                }
            } else {
                console.error('Driver not found:', selectedDriver);
            }
        }
    }, [selectedDriver, totalDriverDistance, drivers, selectedServiceType, totalSalary]);

    useEffect(() => {
        let newTotalSalary = totalSalary;
      
    
        if (editData?.adjustValue) {
            // If editData has adjustValue, prioritize it
            if (!isAdjustmentApplied) {
                setUpdatedTotalSalary(parseFloat(editData.adjustValue) || 0);
            }
        } else if (newTotalSalary !== updatedTotalSalary) {
            // Otherwise, use the calculated newTotalSalary
            setUpdatedTotalSalary(newTotalSalary >= 0 ? newTotalSalary : 0);
        }
    }, [totalSalary, adjustValue, editData?.adjustValue,isEditing]);

    
    const formatDate = (date: any) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

        return `${day}/${month}/${year}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
    };
    // --------------------------------------------------------------------------
    // http://localhost:3000
    // https://sandsnotification.onrender.com
    const sendPushNotification = async (token: any, title: any, body: any, sound: any) => {
        try {
            const response = await fetch('https://sandsnotification.onrender.com/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    title: title,
                    body: body,
                    sound: sound,
                }),
            });

            if (response.ok) {
                console.log('Notification sent successfully');
            } else {
                console.log('Failed to send notification');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };
    const sendAlert = async (token: any, title: any, body: any) => {
        try {
            const response = await fetch('https://sandsnotification.onrender.com/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    title: title,
                    body: body,
                }),
            });

            if (response.ok) {
                console.log('Notification sent successfully');
            } else {
                console.log('Failed to send notification');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };
    const sendNotificationsToAllDrivers = async () => {
        try {
            // Extract all FCM tokens from drivers
            const tokens = drivers.map((driver) => driver.fcmToken).filter((token) => token);
            const notificationTitle = 'Booking Notification';
            const notificationBody = 'A new booking has been added (Dummy).';
            for (const token of tokens) {
                await sendAlert(token, notificationTitle, notificationBody);
            }
        } catch (error) {
            console.error('Error sending notifications to all drivers:', error);
        }
    };

    const addOrUpdateItem = async (): Promise<void> => {
        if (!validateForm()) {
            return; // Stop execution if validation fails
        }
        if (!isButtonClicked) {
            setErrorMessage("Click 'OK' button"); // Show error message if "OK" is not clicked
            return;
        }
        if (validateForm() && !loading) {
            // Check if loading is false before proceeding
            setLoading(true);
            try {
                let selectedDriverData;
                if (selectedDriver === 'dummy') {
                    selectedDriverData = {
                        id: 'dummy', // Set the dummy driver ID
                        driverName: 'DummyDriver',
                        advancePayment: 0, // Set default values for dummy driver
                        netTotalAmountInHand: 0,
                        companyName: 'RSA', // Set a default company name for the dummy driver
                        fcmToken: null,
                        pickupDistance: 0,
                    };
                } else {
                    // Regular driver lookup
                    selectedDriverData = drivers.find((driver) => driver.id === selectedDriver);
                }
                const driverName = selectedDriverData ? selectedDriverData.driverName : 'DummyDriver';
                const selectedCompanyData = companies.find((company) => company.id === selectedCompany);
                const companyBooking = selectedCompanyData ? true : false;
                const companyName = selectedCompanyData ? selectedCompanyData.driverName : '';

                if (selectedCompanyData) {
                    const { advancePayment, netTotalAmountInHand, companyName } = selectedCompanyData;

                    // Check if the condition applies based on the company's name
                    if (companyName === 'Company' && advancePayment < netTotalAmountInHand) {
                        alert('Exceeds Credit Limit Amount');
                        setLoading(false);
                        return; // Stop execution if condition is not met
                    }
                } else if (selectedDriverData) {
                    // const driverName = selectedDriverData.driverName || 'DummyDriver';
                    const { advancePayment, netTotalAmountInHand, companyName } = selectedDriverData;

                    // Check if the condition applies based on the driver's company name
                    if (companyName !== 'RSA' && advancePayment < netTotalAmountInHand) {
                        alert('Exceeds Credit Limit Amount');
                        setLoading(false);
                        return; // Stop execution if condition is not met
                    }
                } else {
                    console.error('No matching company or driver found');
                    setLoading(false);
                    return;
                }
                const fcmToken = selectedDriverData ? selectedDriverData.fcmToken : null;
                const pickupDistance = selectedDriverData ? selectedDriverData.pickupDistance || 0 : 0;

                const currentDate = new Date();
                const dateTime = formatDate(currentDate); // Use the formatted date
                let finalFileNumber = '';

                if (company === 'self') {
                    finalFileNumber = `RSA${bookingId}`;
                } else if (company === 'rsa') {
                    finalFileNumber = fileNumber;
                }

                const formattedPickupLocation = {
                    name: pickupLocation?.name || '',
                    lat: pickupLocation?.lat?.toString() || '',
                    lng: pickupLocation?.lng?.toString() || '',
                };
                const totalDriverDistanceNumber = parseFloat(totalDriverDistance) || 0;

                const bookingData = {
                    driver: driverName,
                    totalSalary: totalSalary,
                    pickupLocation: formattedPickupLocation,
                    dropoffLocation: dropoffLocation || {},
                    status: 'booking added',
                    dateTime: dateTime,
                    deliveryDateTime: deliveryDateTime || null,
                    createdAt: serverTimestamp(),
                    comments: comments || '',
                    bookingId: `${bookingId}`,
                    distance: distance || '',
                    baseLocation: baseLocation || '',
                    showroomLocation: showroomLocation,
                    company: company || '',
                    adjustValue: adjustValue || '',
                    customerName: customerName || '',
                    totalDriverDistance: totalDriverDistanceNumber || 0,
                    totalDriverSalary: totalDriverSalary || 0,
                    mobileNumber: mobileNumber || '',

                    phoneNumber: phoneNumber || '',
                    vehicleType: vehicleType || '',
                    bodyShope: bodyShope || '',
                    statusEdit: activeForm === 'withoutMap' ? 'mapbooking' : 'withoutmapbooking',
                    selectedCompany: selectedCompany || '',
                    serviceType: serviceType || '',
                    serviceCategory: serviceCategory || '',
                    vehicleModel: vehicleModel || '',
                    vehicleSection: vehicleSection || '',
                    vehicleNumber: vehicleNumber || '',
                    fileNumber: finalFileNumber || '',
                    selectedDriver: selectedDriver || '',
                    trappedLocation: trappedLocation || '',
                    updatedTotalSalary: updatedTotalSalary || 0,
                    insuranceAmountBody: insuranceAmountBody || '',
                    receivedAmount: receivedAmount || 0,
                    receivedAmountCompany: receivedAmountCompany || 0,
                    pickupDistance: pickupDistance,
                    companyBooking: companyBooking,
                    companyName: companyName,
                    newStatus: '',
                    editedTime: '',
                };

                if (editData) {
                    const existingDocRef = doc(db, `user/${uid}/bookings`, editData.id);
                    const existingBooking = await getDoc(existingDocRef);
                    if (existingBooking.exists()) {
                        const existingData = existingBooking.data();
                        bookingData.createdAt = existingData.createdAt;

                        // Check if the current status is 'Rejected'
                        if (existingData.status === 'Rejected') {
                            bookingData.status = 'booking added'; // Override with 'booking added'
                        } else {
                            bookingData.status = existingData.status; // Keep the old status
                        }
                    }
                    if (role === 'admin') {
                        bookingData.newStatus = `Edited by ${role}`;
                    } else if (role === 'staff') {
                        bookingData.newStatus = `Edited by ${role} ${userName}`;
                    }
                    bookingData.editedTime = formatDate(new Date());
                } else {
                    // For new booking, add "Added by" status
                    bookingData.newStatus = `Added by ${role} ${userName}`;
                }
                // Schedule the booking at deliveryDateTime if provided
                if (deliveryDateTime) {
                    console.log('Delivery DateTime (Raw Input):', deliveryDateTime); // Log raw deliveryDateTime value

                    const deliveryDate = new Date(deliveryDateTime);
                    console.log('Delivery DateTime (Parsed as Date):', deliveryDate.toString()); // Log parsed date

                    const currentDate = new Date();
                    console.log('Current DateTime:', currentDate.toString()); // Log current date

                    const timeToCreateBooking = deliveryDate.getTime() - currentDate.getTime();

                    if (timeToCreateBooking > 0) {
                        // Convert timeToCreateBooking into a date-time format
                        const bookingScheduledTime = new Date(currentDate.getTime() + timeToCreateBooking);
                        console.log('timeToCreateBooking in DateTime:', bookingScheduledTime.toString());
                        console.log('Delivery Date:', deliveryDate.toString());
                        console.log('Current Date:', currentDate.toString());

                        setTimeout(async () => {
                            if (editData) {
                                const docRef = doc(db, `user/${uid}/bookings`, editData.id);
                                await updateDoc(docRef, bookingData);
                                console.log('Document updated at delivery time');
                            } else {
                                const docRef = await addDoc(collection(db, `user/${uid}/bookings`), bookingData);
                                console.log('Document created at delivery time with ID:', docRef.id);
                            }

                            if (selectedDriver === 'dummy') {
                                await sendNotificationsToAllDrivers();
                            } else if (fcmToken) {
                                await sendAlert(fcmToken, 'Booking Notification', 'Your booking has been updated');
                            }
                        }, timeToCreateBooking);

                        // Schedule the notification
                        setTimeout(async () => {
                            await sendAlert(fcmToken, 'Delivery Reminder', `Your booking is scheduled for delivery on ${formatDate(deliveryDate)}`);
                        }, timeToCreateBooking);
                    }
                } else {
                    // If no deliveryDateTime, process the booking immediately
                    if (editData) {
                        const docRef = doc(db, `user/${uid}/bookings`, editData.id);
                        await updateDoc(docRef, bookingData);
                        console.log('Document updated');
                    } else {
                        const docRef = await addDoc(collection(db, `user/${uid}/bookings`), bookingData);
                        console.log('Document written with ID: ', docRef.id);
                    }

                    // Check if the dummy driver is selected
                    if (selectedDriver === 'dummy') {
                        await sendNotificationsToAllDrivers();
                    } else if (fcmToken) {
                        await sendPushNotification(fcmToken, 'Booking Notification', 'Your booking has been updated', 'alert_notification');
                    }

                    if (deliveryDateTime) {
                        const deliveryDate = new Date(deliveryDateTime);
                        const timeToNotify = deliveryDate.getTime() - currentDate.getTime();

                        if (timeToNotify > 0) {
                            // Schedule the notification
                            setTimeout(async () => {
                                await sendPushNotification(fcmToken, 'Delivery Reminder', `Your booking is scheduled for delivery on ${formatDate(deliveryDate)}`, 'alert_notification');
                            }, timeToNotify);
                        }
                    }
                }
                navigate('/bookings/newbooking');
            } catch (error) {
                console.error('Error adding/updating item:', error);
            }
        }
    };

    const handleButtonClick = (event: any) => {
        event.preventDefault();
        setShowShowroomModal(true);
    };

    return (
        <div className={styles.bookingFormContainer}>
            <div className={styles.dateTime}>{currentDateTime}</div>
            <h2 className={styles.formHeading}>BOOK WITHOUT MAP</h2>
            <div className={styles.dateTime}>
                Booking ID : <span style={{ color: 'red' }}>{bookingId}</span>
            </div>
            <form className={styles.bookingForm}>
                <div className="mb-4">
                    <label htmlFor="deliveryDateTime" className={`${styles.label} block mb-2`}>
                        Pickup Date & Time <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={deliveryDateTime}
                        onChange={(e) => setDeliveryDateTime(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="company" className={styles.label}>
                        Company
                    </label>
                    <select id="company" name="company" value={company} className={styles.formControl} onChange={(e) => handleInputChange('company', e.target.value)}>
                        <option value="">Select company</option>
                        {/* <option value="rsa">RSA Work</option> */}
                        <option value="self">Payment Work</option>
                    </select>
                    {/* {errors.company && <p className={styles.errorMessage}>{errors.company}</p>} */}
                </div>

                {company === 'self' ? (
                    <div className={styles.flexRow}>
                        <label htmlFor="fileNumber" className={`${styles.label}`}>
                            File Number
                        </label>
                        <div className={styles.inputContainer}>
                            <input id="fileNumber" type="text" name="fileNumber" placeholder="Enter File Number" className={styles.formControl} value={`RSA${bookingId}`} readOnly />
                        </div>
                        {errors.fileNumber && <p className="text-red-500 text-sm mt-1">{errors.fileNumber}</p>}
                    </div>
                ) : (
                    <div className={styles.flexRow}>
                        <label htmlFor="fileNumber" className={`${styles.label}`}>
                            File Number
                        </label>
                        <div className={styles.inputContainer}>
                            <input
                                id="fileNumber"
                                type="text"
                                name="fileNumber"
                                className={styles.formControl}
                                placeholder="Enter File Number"
                                value={fileNumber}
                                onChange={(e) => handleInputChange('fileNumber', e.target.value)}
                            />
                            {errors.fileNumber && <p className="text-red-500 text-sm mt-1">{errors.fileNumber}</p>}
                        </div>
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="pickupLocation" className={styles.label}>
                        Pickup Location
                    </label>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            id="pickupLocation"
                            name="pickupLocation"
                            className={`${styles.formControl} ${styles.smallInput}`}
                            placeholder="Pickup Location"
                            onChange={handleLocationChange}
                            value={manualInput}
                        />
                                                {errors.pickupLocation && <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>}

                        <input
                            type="text"
                            id="latLng"
                            name="latLng"
                            className={`${styles.formControl} ${styles.largeInput}`}
                            placeholder="Latitude, Longitude"
                            value={pickupLocation.lat && pickupLocation.lng ? `${pickupLocation.lat}, ${pickupLocation.lng}` : ''}
                            onChange={(e) => {
                                const [lat, lng] = e.target.value.split(',').map((coord) => coord.trim());
                                handleManualChange('lat', parseFloat(lat));
                                handleManualChange('lng', parseFloat(lng));
                            }}
                            autoComplete="off"
                        />
                         {errors.pickupLocationLat && errors.pickupLocationLng && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.pickupLocationLat}
                                {errors.pickupLocationLng}
                            </p>
                        )}
                        <a href={`https://www.google.com/maps/search/?api=1&query=${pickupLocation.lat},${pickupLocation.lng}`} target="_blank" rel="noopener noreferrer" className={styles.mapButton}>
                            <IconMapPin />
                        </a>
                    </div>
                </div>

                <div className={styles.formGroup}>
    <label htmlFor="baseLocation" className={styles.label}>
        Start Location
    </label>
    <input
        type="text"
        id="baseLocation"
        name="baseLocation"
        className={styles.formControl}
        placeholder="Enter start location (name, lat, lng)"
        value={baseLocation ? `${baseLocation.name} , ${baseLocation.lat} , ${baseLocation.lng}` : ''}
        onChange={(e) => {
            const [name, lat, lng] = e.target.value.split(',').map(item => item.trim());
            setBaseLocation({ name, lat, lng });
        }}
    />
                        {errors.baseLocation && <p className="text-red-500 text-sm mt-1">{errors.baseLocation}</p>}

</div>

                {/* ----------------------------------------------------------------------------------------- */}
                {/* <div className={styles.formGroup}>
                    <label htmlFor="showrooms" className={styles.label}>
                        Service Center
                    </label>
                    <div className={styles.inputContainer}>
                        {showrooms.length > 0 && (
                            <ReactSelect
                                id="showrooms"
                                name="showrooms"
                                className="w-full"
                                value={showrooms.find((option) => option.value === showroomLocation) || null}
                                options={showrooms}
                                placeholder="Select showroom"
                                onChange={(selectedOption) => handleInputChange('showroomLocation', selectedOption ? selectedOption.value : '')}
                                isSearchable={true}
                                getOptionLabel={(option) => option.label} // Ensure this always returns a string
                                styles={{
                                    option: (provided: any, state: any) => ({
                                        ...provided,
                                        color: state.data.value === 'lifting' ? 'red' : provided.color,
                                        fontSize: state.data.value === 'lifting' ? '20px' : provided.fontSize,
                                        fontWeight: state.data.value === 'lifting' ? 'bold' : provided.fontWeight,
                                    }),
                                }}
                            />
                        )}
                        <button onClick={handleButtonClick} className={styles.addButton}>
                            <IconPlus />
                        </button>
                    </div>
                    {showShowroomModal && <ShowroomModalWithout onClose={() => setShowShowroomModal(false)} updateShowroomLocation={updateShowroomLocation} />}
                </div> */}

                <div className={styles.formGroup}>
                    <label htmlFor="dropoffLocation" className={styles.label}>
                        Dropoff location
                    </label>
                    <div className={styles.inputRowOfdropoff}>
                        <input onChange={handleLocationChange1} type="text" className={styles.formControlDropOff} placeholder="Dropoff Location" value={manualInput1} />

                        <input
                            onChange={(e) => handleManualChange1('lat', e.target.value)}
                            type="text"
                            className={styles.formControlDropOff}
                            placeholder="Latitude"
                            value={dropoffLocation && dropoffLocation.lat ? dropoffLocation.lat : ''}
                        />

                        <input
                            onChange={(e) => handleManualChange1('lng', e.target.value)}
                            type="text"
                            className={styles.formControlDropOff}
                            placeholder="Longitude"
                            value={dropoffLocation && dropoffLocation.lng ? dropoffLocation.lng : ''}
                        />
                    </div>
                </div>
                <div>
                    <div className={styles.formGroup}>
                        <label htmlFor="distance" className={styles.label}>
                            Total Distance (KM)
                        </label>
                        <div className={styles.inputWithIcon}>
                            <input
                                style={{ color: 'red' }}
                                id="distance"
                                type="text"
                                name="distance"
                                placeholder="Total Distance"
                                value={distance}
                                className={styles.formControl}
                                onChange={(e) => handleInputChange('distance', e.target.value)}
                            />
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&origin=${baseLocation?.lat},${baseLocation?.lng}&destination=${baseLocation?.lat},${baseLocation?.lng}&waypoints=${pickupLocation?.lat},${pickupLocation?.lng}|${dropoffLocation?.lat},${dropoffLocation?.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.iconWrapper}
                            >
                                <IconMapPin />
                            </a>
                        </div>
                        {errors.distance && <p className="text-red-500 text-sm mt-1">{errors.distance}</p>}

                    </div>
                </div>

                <div className={styles.trappedLocationContainer}>
                    <label htmlFor="trappedLocation" className={styles.trappedLocationLabel}>
                        Trapped Location
                    </label>
                    <div className={styles.radioButtonsGroup}>
                        <div className={styles.radioButton}>
                            <input
                                type="radio"
                                id="onRoad"
                                name="trappedLocation"
                                value="onRoad"
                                checked={trappedLocation === 'onRoad'}
                                onChange={(e) => handleInputChange('trappedLocation', e.target.value)}
                                className={styles.radioInput}
                            />
                            <label htmlFor="onRoad" className={styles.radioLabel}>
                                On Road
                            </label>
                        </div>
                        <div className={styles.radioButton}>
                            <input
                                type="radio"
                                id="inHouse"
                                name="trappedLocation"
                                value="inHouse"
                                checked={trappedLocation === 'inHouse'}
                                onChange={(e) => handleInputChange('trappedLocation', e.target.value)}
                                className={styles.radioInput}
                            />
                            <label htmlFor="inHouse" className={styles.radioLabel}>
                                In House
                            </label>
                        </div>
                        <div className={styles.radioButton}>
                            <input
                                type="radio"
                                id="outsideOfRoad"
                                name="trappedLocation"
                                value="outsideOfRoad"
                                checked={trappedLocation === 'outsideOfRoad'}
                                onChange={(e) => handleInputChange('trappedLocation', e.target.value)}
                                className={styles.radioInput}
                            />
                            <label htmlFor="outsideOfRoad" className={`${styles.radioLabel} ${styles.textDanger}`}>
                                Outside of Road
                            </label>
                        </div>
                    </div>
                    {errors.trappedLocation && <span className="text-red-500 text-sm mt-1">{errors.trappedLocation}</span>}
                </div>

                {trappedLocation === 'outsideOfRoad' && (
                    <div className={styles.formGroup}>
                        <label htmlFor="updatedTotalSalary" className={styles.label}>
                            Updated Total Amount
                        </label>
                        <input
                            id="updatedTotalSalary"
                            type="number"
                            name="updatedTotalSalary"
                            placeholder="Enter Total Salary"
                            onChange={(e) => setUpdatedTotalSalary(Number(e.target.value))}
                            required
                            value={updatedTotalSalary}
                            className={styles.formControl}
                        />
                    </div>
                )}
                {!disableFields && (
                    <div className={styles.formGroup}>
                        <label htmlFor="serviceType" className={styles.label}>
                            Service Type
                        </label>
                        <select
                            id="serviceType"
                            name="serviceType"
                            className="form-select flex-1"
                            value={serviceType}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                fontSize: '1rem',
                                outline: 'none',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            }}
                            onChange={(e) => handleInputChange('serviceType', e.target.value)}
                        >
                            <option value="">Select Service Type</option>
                            {serviceTypes.map((service) => (
                                <option key={service.id} value={service.name}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                        {errors.serviceType && <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>}

                    </div>
                )}

                {!disableFields && (
                    <div className={styles.formGroup}>
                        <label htmlFor="driver" className={styles.label}>
                            Driver
                        </label>
                        <input
                            id="driver"
                            type="text"
                            name="driver"
                            placeholder="Select your driver"
                            onClick={() => openModal(distance)}
                            value={selectedDriver ? selectedDriverData?.driverName || 'DummyDriver' : ''}
                            readOnly
                            className={styles.formControl}
                        />
                    </div>
                )}
                 <ReactModal isOpen={isModalOpen} onRequestClose={closeModal} style={customStyles}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <div style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9', zIndex: 999, padding: '10px', borderBottom: '1px solid #ddd' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontSize: '20px', fontWeight: '600' }}>Available Drivers for {serviceType}</h2>
                            <button onClick={closeModal} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" style={{ marginLeft: 'auto', marginRight: '10px' }}>
                                OK
                            </button>
                        </div>

                        <div>
                            <div className="grid  gap-4">
                                {/* Dummy driver with placeholder values */}
                                <div className="border border-gray-300 p-4 rounded-lg shadow-sm bg-white">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr>
                                                <th className="py-2 px-4 text-left">Driver Name</th>
                                                <th className="py-2 px-4 text-left">Pickup Distance</th>

                                                <th className="py-2 px-4 text-left">Payable Amount</th>
                                                <th className="py-2 px-4 text-left font-bold text-violet-600">Profit after Deducting Expenses</th>
                                                <th className="py-2 px-4 text-left  text-red-600">Leave Status</th>
                                                <th className="py-2 px-4 text-left font-bold">Current Status</th> {/* New Column Header */}

                                                <th className="py-2 px-4 text-left">Select</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="py-2 px-4 font-semibold text-blue-800" style={{ fontSize: '18px' }}>
                                                    DummyDriver
                                                </td>
                                                <td className="py-2 px-4 font-semibold text-blue-800">0.00</td>
                                                <td className="py-2 px-4 font-semibold text-blue-800">0.00</td>

                                                <td className="py-2 px-4 text-red-600 font-semibold text-blue-800">0.00</td>
                                                <td className="py-2 px-4 text-red-600">--------</td>
                                                <td className="py-2 px-4 text-red-600">--------</td>

                                                <td className="py-2 px-4">
                                                    <input
                                                        type="radio"
                                                        name="selectedDriver"
                                                        value="dummy"
                                                        checked={selectedDriver === 'dummy'}
                                                        onChange={() => handleInputChange('selectedDriver', 'dummy')}
                                                    />
                                                </td>
                                            </tr>
                                           
                                        </tbody>
                                    </table>
                                </div>

                                {/* Actual drivers */}

                                {drivers
                                    .filter((driver) => driver.companyName !== 'Company') // Filter out drivers from the specified company
                                    .sort((a, b) => {
                                        if (a.companyName === 'RSA' && b.companyName !== 'RSA') return -1;
                                        if (a.companyName !== 'RSA' && b.companyName === 'RSA') return 1;
                                        return 0;
                                    })
                                    .map((driver) => {
                                        const isRSA = driver.companyName !== 'Company';

                                        // Determine the selected service based on serviceType for both RSA and non-RSA companies
                                        const selectedService = isRSA
                                            ? serviceType // Use the provided serviceType for RSA companies
                                            : driver.selectedServices.find((service: any) => service === serviceType); // Use the selected service type for non-RSA drivers

                                        // Fallback handling in case no service matches
                                        if (!selectedService) {
                                            console.error(`No matching service found for driver ${driver.id} and serviceType ${serviceType}`);
                                            return null;
                                        }

                                        // Get salary details based on whether it's an RSA or non-RSA company
                                        const salary =
                                            isRSA && selectedCompanyData
                                                ? selectedCompanyData.basicSalaries[selectedService] // For RSA companies, get salary from selectedCompanyData
                                                : !isRSA
                                                ? driver.basicSalaries[selectedService] // For non-RSA companies, get salary from driver data
                                                : serviceDetails.salary;

                                        const basicSalaryKM =
                                            isRSA && selectedCompanyData
                                                ? selectedCompanyData.basicSalaryKm[selectedService]
                                                : !isRSA
                                                ? driver.basicSalaryKm[selectedService]
                                                : serviceDetails.basicSalaryKM;

                                        const salaryPerKM =
                                            isRSA && selectedCompanyData ? selectedCompanyData.salaryPerKm[selectedService] : !isRSA ? driver.salaryPerKm[selectedService] : serviceDetails.salaryPerKM;

                                        const parsedDistance = parseFloat(distance) || 0; // Ensure distance is a number
                                        const calculatedSalary = calculateTotalSalary(salary, parsedDistance, basicSalaryKM, salaryPerKM, isRSA);

                                        // Calculate profit based on expenses per KM
                                        const expensePerKM = serviceDetails.expensePerKM || 0;
                                        const profit = calculatedSalary - parsedDistance * expensePerKM;
                                        const isOnLeave = driverLeaves.some((leave: DriverLeave) => leave.driverId === driver.id);

                                        return (
                                            <div key={driver.id} className="border border-gray-300 p-4 rounded-lg shadow-sm bg-white">
                                                <table className="w-full table-auto">
                                                    <thead>
                                                        <tr>
                                                            <th className="py-2 px-4 text-left">Driver Name</th>
                                                            <th className="py-2 px-4 text-left">Pickup Distance</th>

                                                            <th className="py-2 px-4 text-left">Payable Amount</th>
                                                            <th className="py-2 px-4 text-left font-bold text-violet-600">Profit after Deducting Expenses</th>
                                                            <th className="py-2 px-4 text-left font-bold text-red-600">Leave Status</th>
                                                            <th className="py-2 px-4 text-left font-bold">Current Status</th> {/* New Column Header */}

                                                            <th className="py-2 px-4 text-left">Select</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                className="py-2 px-4 font-semibold"
                                                                style={{
                                                                    color: driver.companyName !== 'Company' && driver.companyName !== 'RSA' ? 'red' : 'green',
                                                                    fontSize: '18px',
                                                                }}
                                                            >
                                                                {driver.driverName || 'Unknown Driver'}
                                                            </td>
                                                            <td className="py-2 px-4">{driver.pickupDistance}</td> {/* Display the pickup distance here */}
                                                            <td className="py-2 px-4">{calculatedSalary.toFixed(2)}</td>
                                                            <td className="py-2 px-4 text-red-600 font-semibold" style={{ backgroundColor: '#ffe6e6' }}>
                                                                {profit.toFixed(2)}
                                                            </td>
                                                            <td
                                                                style={{
                                                                    color: isOnLeave ? 'red' : 'green',
                                                                    fontSize: isOnLeave ? '1.2em' : '1.2em',
                                                                    fontWeight: 'bold',
                                                                }}
                                                            >
                                                                {isOnLeave ? 'Leave Today' : 'Available'}
                                                            </td>
                                                            <td className="py-2 px-4 text-blue-800 font-semibold">{driver.newStatus || 'Unknown'}</td> {/* New Column Data */}

                                                            <td className="py-2 px-4">
                                                                <input
                                                                    type="radio"
                                                                    name="selectedDriver"
                                                                    value={driver.id}
                                                                    checked={selectedDriver === driver.id}
                                                                    onChange={() => handleInputChange('selectedDriver', driver.id)}
                                                                />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </ReactModal>

                {selectedDriver && selectedDriverData && (
                    <React.Fragment>
                        <div>
                        <VehicleSection
                                totalSalary={totalSalary}
                                updatedTotalSalary={updatedTotalSalary}
                                onUpdateTotalSalary={handleUpdateTotalSalary}
                                onAdjustValueChange={handleAdjustValueChange}
                                adjustValue={adjustValue}
                                onApplyAdjustment={handleApplyAdjustment} // <-- Add this line to pass the function
                            />

                            {errors.applyAdjustment && (
                                <div
                                    style={{
                                        backgroundColor: '#f44336', // Red background
                                        color: '#fff', // White text
                                        padding: '10px',
                                        borderRadius: '5px',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        animation: 'blink 1s linear infinite', // Blinking effect
                                    }}
                                >
                                    {errors.applyAdjustment}
                                </div>
                            )}

<div className="mt-4 flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
  {/* Total Payable Amount */}
  <div className="flex items-center w-full lg:w-1/2 space-x-2">
    <label htmlFor="updatedTotalSalary" className="mb-0 text-gray-700 font-medium">
      Total Payable Amount
    </label>
    <div className="form-input flex-1">
      <input
        id="updatedTotalSalary"
        type="text"
        name="updatedTotalSalary"
        className="w-full text-danger p-2 border border-gray-300 rounded-md text-lg outline-none shadow-sm"
        value={updatedTotalSalary}
        readOnly
      />
    </div>
  </div>

  {/* Confirm Payable Amount */}
  <div className="flex items-center w-full lg:w-1/2 space-x-2">
    <label htmlFor="confirmUpdatedTotalSalary" className="mb-0 text-gray-700 font-medium">
      Confirm Payable Amount
    </label>
    <div className="form-input flex items-center gap-2 flex-1">
      <input
        id="confirmUpdatedTotalSalary"
        type="text"
        name="confirmUpdatedTotalSalary"
        className="w-full text-success p-2 border border-gray-300 rounded-md text-lg outline-none shadow-sm"
        value={confirmUpdatedTotalSalary}
        onChange={(e) => setConfirmUpdatedTotalSalary(e.target.value)}
      />
      <button
        type="button"
        className={`px-4 py-2 rounded shadow ${isButtonClicked ? 'bg-green-500' : 'bg-blue-500'} text-white`}
        onClick={handleConfirm}
      >
        OK
      </button>
    </div>
    {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
  </div>
</div>

                            {showModal && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="bg-red-500 text-white p-4 rounded shadow-lg w-1/3" style={{ textAlign: 'center' }}>
                                        <p>
                                            Confirm that <strong>Confirm Payable Amount</strong> equals <strong>Payable Amount (with insurance)</strong>.
                                        </p>
                                        <button onClick={closeModalU} className="mt-4 px-4 py-2 bg-white text-red-500 font-bold rounded">
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="totalDriverDistance" className={styles.label}>
                        Total Driver Distance
                    </label>
                    <input
                        id="totalDriverDistance"
                        type="text"
                        name="totalDriverDistance"
                        placeholder="Enter Driver Distance"
                        onChange={(e) => handleInputChange('totalDriverDistance', e.target.value)}
                        value={totalDriverDistance}
                        className={styles.formControl}
                    />
                </div>
                {totalDriverDistance && (
                    <div className={styles.formGroup}>
                        <label htmlFor="totalDriverSalary" className={styles.label}>
                            Driver Salary
                        </label>
                        <input
                            id="totalDriverSalary"
                            type="text"
                            name="totalDriverSalary"
                            placeholder="Enter Driver Salary"
                            onChange={(e) => handleInputChange('totalDriverSalary', e.target.value)}
                            value={totalDriverSalary}
                            className={styles.formControl}
                        />
                                            {errors.totalDriverDistance && <p className="text-red-500 text-sm mt-1">{errors.totalDriverDistance}</p>}

                    </div>
                )}
                <div className={styles.formGroup}>
                    <label htmlFor="customerName" className={styles.label}>
                        Customer Name
                    </label>
                    <input
                        id="customerName"
                        name="customerName"
                        type="text"
                        placeholder="Enter Name"
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        value={customerName}
                        className={styles.formControl}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="phoneNumber" className={styles.label}>
                        Mobile Number 1
                    </label>
                    <input
                        id="phoneNumber"
                        type="tel"
                        name="phoneNumber"
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className={styles.formControl}
                        value={phoneNumber}
                        placeholder="Enter Phone number"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="mobileNumber" className={styles.label}>
                        Mobile Number 2
                    </label>
                    <input
                        type="tel"
                        id="mobileNumber"
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        name="mobileNumber"
                        className={styles.formControl}
                        value={mobileNumber}
                        placeholder="Enter your Mobile number"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="vehicleNumber" className={styles.label}>
                        Customer Vehicle Number
                    </label>
                    <input
                        id="vehicleNumber"
                        type="text"
                        name="vehicleNumber"
                        placeholder="Enter vehicle number"
                        onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                        value={vehicleNumber}
                        className={styles.formControl}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="vehicleType" className={styles.label}>
                        Vehicle Type (2 or 3 or 4 wheeler)
                    </label>
                    <div className={styles.inputContainer}>
                        <select
                            id="vehicleType"
                            name="vehicleType"
                            className="form-select flex-1"
                            value={vehicleType}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                fontSize: '1rem',
                                outline: 'none',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            }}
                            onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                        >
                            <option value="">Select vehicle type</option>
                            <option value="2">2 Wheeler</option>
                            <option value="3">3 Wheeler</option>
                            <option value="4">4 Wheeler</option>
                            <option value="6">8 Wheeler</option>
                            <option value="12">12 Wheeler</option>
                            <option value="14">14 Wheeler</option>
                            <option value="16">16 Wheeler</option>
                            <option value="20">20 Wheeler</option>
                        </select>
                    </div>
                    {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}

                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="vehicleModel" className={styles.label}>
                        Brand Name
                    </label>
                    <input
                        id="vehicleModel"
                        name="vehicleModel"
                        type="text"
                        placeholder="Brand name"
                        onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                        value={vehicleModel}
                        className={styles.formControl}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="showrooms" className={styles.label}>
                        Comments
                    </label>
                    <textarea
                        id="reciever-name"
                        placeholder="Comments"
                        name="reciever-name"
                        onChange={(e) => handleInputChange('comments', e.target.value)}
                        value={comments}
                        className={styles.formControl}
                    />
                </div>

                <button type="button" onClick={addOrUpdateItem} className={styles.submitButton}>
                    {editData ? 'Update' : 'Save'}
                </button>
            </form>
        </div>
    );
};
export default WithoutMapBooking;

