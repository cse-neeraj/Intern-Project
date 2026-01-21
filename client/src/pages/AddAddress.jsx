import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const InputField = ({ type, placeholder, name, handleChange, value }) => (
  <input
    className="w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition"
    type={type}
    placeholder={placeholder}
    name={name}
    onChange={handleChange}
    value={value}
    required
  />
);

const AddAddress = () => {

  const { axios, user, navigate } = useAppContext();
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phone: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({ ...prevAddress, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/address/add", address);
      if (data.success) {
        toast.success(data.message);
        navigate("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    
  };

  useEffect(() => { 
    if (!user) {
      navigate('/cart')  
    }
  }, [])


  return (
    <div className="mt-16 pb-16">
      <p className="text-2xl md:text-3xl text-gray-500">
        Add shipping
        <span className="font-semibold text-primary"> Address </span>
      </p>

      <div className="flex flex-col-reverse md:flex-row justify-between mt-10">
        <div className="flex-1 max-w-md">
          <form onSubmit={onSubmitHandler} className="space-y-3 mt-6 text-sm">
            <div className="flex gap-3">
              <InputField
                type="text"
                placeholder="First Name"
                name="firstName"
                handleChange={handleChange}
                value={address.firstName}
              />
              <InputField
                type="text"
                placeholder="Last Name"
                name="lastName"
                handleChange={handleChange}
                value={address.lastName}
              />
            </div>
            <InputField
              type="email"
              placeholder="Email"
              name="email"
              handleChange={handleChange}
              value={address.email}
            />
            <InputField
              type="text"
              placeholder="Street Address"
              name="street"
              handleChange={handleChange}
              value={address.street}
            />
            <div className="flex gap-3">
              <InputField
                type="text"
                placeholder="City"
                name="city"
                handleChange={handleChange}
                value={address.city}
              />
              <InputField
                type="text"
                placeholder="State"
                name="state"
                handleChange={handleChange}
                value={address.state}
              />
            </div>
            <div className="flex gap-3">
              <InputField
                type="number"
                placeholder="Zip Code"
                name="zipCode"
                handleChange={handleChange}
                value={address.zipCode}
              />
              <InputField
                type="text"
                placeholder="Country"
                name="country"
                handleChange={handleChange}
                value={address.country}
              />
            </div>
            <InputField
              type="number"
              placeholder="Phone"
              name="phone"
              handleChange={handleChange}
              value={address.phone}
            />

            <button
              type="submit"
              className="w-full py-3 mt-4 bg-primary text-white font-medium rounded hover:bg-primary-dull transition"
            >
              Save Address
            </button>
          </form>
        </div>
        <img
          className="md:mr-16 mb-16 md:mb-0"
          src={assets.add_address_image}
          alt="add address"
        />
      </div>
    </div>
  );
};

export default AddAddress;
