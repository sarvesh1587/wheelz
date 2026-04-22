import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vehicleAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function VendorEditVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    year: 2024,
    category: "car",
    subCategory: "sedan",
    fuelType: "petrol",
    transmission: "manual",
    seatingCapacity: 4,
    basePrice: 1000,
    locationName: "",
    city: "",
    images: [],
  });

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const res = await vehicleAPI.getOne(id);
      const vehicle = res.data.vehicle;
      setFormData({
        name: vehicle.name || "",
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        year: vehicle.year || 2024,
        category: vehicle.category || "car",
        subCategory: vehicle.subCategory || "sedan",
        fuelType: vehicle.fuelType || "petrol",
        transmission: vehicle.transmission || "manual",
        seatingCapacity: vehicle.seatingCapacity || 4,
        basePrice: vehicle.basePrice || 1000,
        locationName: vehicle.locationName || "",
        city: vehicle.city || "",
        images: vehicle.images || [],
      });
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      toast.error("Failed to fetch vehicle details");
      navigate("/vendor/vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, images: [...formData.images, reader.result] });
      setUploadingImage(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read image");
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (indexToRemove) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vehicleAPI.update(id, formData);
      toast.success("Vehicle updated successfully!");
      navigate("/vendor/vehicles");
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error(error.response?.data?.message || "Failed to update vehicle");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Edit Vehicle
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="Brand"
            value={formData.brand}
            onChange={(e) =>
              setFormData({ ...formData, brand: e.target.value })
            }
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="Model"
            value={formData.model}
            onChange={(e) =>
              setFormData({ ...formData, model: e.target.value })
            }
            className="input-field"
            required
          />
          <input
            type="number"
            placeholder="Year"
            value={formData.year}
            onChange={(e) =>
              setFormData({ ...formData, year: parseInt(e.target.value) })
            }
            className="input-field"
            required
          />

          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="input-field"
          >
            <option value="car">Car</option>
            <option value="bike">Bike</option>
          </select>

          <select
            value={formData.subCategory}
            onChange={(e) =>
              setFormData({ ...formData, subCategory: e.target.value })
            }
            className="input-field"
            required
          >
            {formData.category === "car" ? (
              <>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="luxury">Luxury</option>
              </>
            ) : (
              <>
                <option value="cruiser">Cruiser</option>
                <option value="sports">Sports</option>
                <option value="scooter">Scooter</option>
              </>
            )}
          </select>

          <select
            value={formData.fuelType}
            onChange={(e) =>
              setFormData({ ...formData, fuelType: e.target.value })
            }
            className="input-field"
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <select
            value={formData.transmission}
            onChange={(e) =>
              setFormData({ ...formData, transmission: e.target.value })
            }
            className="input-field"
          >
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>

          <input
            type="number"
            placeholder="Seating Capacity"
            value={formData.seatingCapacity}
            onChange={(e) =>
              setFormData({
                ...formData,
                seatingCapacity: parseInt(e.target.value),
              })
            }
            className="input-field"
          />
          <input
            type="number"
            placeholder="Price per day"
            value={formData.basePrice}
            onChange={(e) =>
              setFormData({ ...formData, basePrice: parseInt(e.target.value) })
            }
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="Location Name"
            value={formData.locationName}
            onChange={(e) =>
              setFormData({ ...formData, locationName: e.target.value })
            }
            className="input-field col-span-2"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium mb-2">
            Vehicle Images
          </label>
          {formData.images.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-3">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Vehicle ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-xl w-fit">
            <PhotoIcon className="w-5 h-5" />
            <span>{uploadingImage ? "Uploading..." : "Add New Photo"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/vendor/vehicles")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Update Vehicle
          </button>
        </div>
      </form>
    </div>
  );
}
