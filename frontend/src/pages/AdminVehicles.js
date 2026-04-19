import React, { useState, useEffect } from "react";
import { vehicleAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
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
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleAPI.getAll({ limit: 100 });
      setVehicles(res.data.vehicles);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      toast.error("Failed to fetch vehicles");
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
      const base64String = reader.result;
      setFormData({
        ...formData,
        images: [...formData.images, base64String],
      });
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

    // Validation
    if (!formData.name) {
      toast.error("Vehicle name is required");
      return;
    }
    if (!formData.brand) {
      toast.error("Brand is required");
      return;
    }
    if (!formData.model) {
      toast.error("Model is required");
      return;
    }
    if (!formData.subCategory) {
      toast.error("Sub Category is required");
      return;
    }
    if (!formData.locationName) {
      toast.error("Location Name is required");
      return;
    }
    if (!formData.city) {
      toast.error("City is required");
      return;
    }
    if (formData.images.length === 0 && !editingVehicle) {
      toast.error("At least one image is required");
      return;
    }

    try {
      const vehicleData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        category: formData.category,
        subCategory: formData.subCategory,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        seatingCapacity: parseInt(formData.seatingCapacity),
        basePrice: parseInt(formData.basePrice),
        locationName: formData.locationName.trim(),
        city: formData.city.trim(),
        images: formData.images,
      };

      if (editingVehicle) {
        await vehicleAPI.update(editingVehicle._id, vehicleData);
        toast.success("Vehicle updated successfully!");
      } else {
        await vehicleAPI.create(vehicleData);
        toast.success("Vehicle created successfully!");
      }

      setShowModal(false);
      setEditingVehicle(null);
      resetForm();
      fetchVehicles();
    } catch (err) {
      console.error("Error saving vehicle:", err);
      toast.error(err.response?.data?.message || "Failed to save vehicle");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await vehicleAPI.delete(id);
        toast.success("Vehicle deleted successfully");
        fetchVehicles();
      } catch (err) {
        console.error("Error deleting vehicle:", err);
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const openModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        name: vehicle.name || "",
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        year: vehicle.year || new Date().getFullYear(),
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
    } else {
      setEditingVehicle(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
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
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.city?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Vehicles
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add, edit, or remove vehicles from inventory
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Vehicle
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price/Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVehicles.map((vehicle) => (
                <tr
                  key={vehicle._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          vehicle.images?.[0] ||
                          "https://via.placeholder.com/400x300?text=No+Image"
                        }
                        alt={vehicle.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {vehicle.brand} {vehicle.model}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{vehicle.category}</td>
                  <td className="px-6 py-4 font-semibold">
                    ₹{vehicle.basePrice.toLocaleString()}/day
                  </td>
                  <td className="px-6 py-4">{vehicle.city}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {vehicle.isAvailable ? "Available" : "Booked"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(vehicle)}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                        title="Edit Vehicle"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle._id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                        title="Delete Vehicle"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No vehicles found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Vehicle Modal with Image Upload */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold">
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Vehicle Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
                  required
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
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="luxury">Luxury</option>
                  <option value="cruiser">Cruiser</option>
                  <option value="sports">Sports</option>
                  <option value="scooter">Scooter</option>
                </select>

                <select
                  value={formData.fuelType}
                  onChange={(e) =>
                    setFormData({ ...formData, fuelType: e.target.value })
                  }
                  className="input-field"
                  required
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
                  required
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
                  required
                />

                <input
                  type="number"
                  placeholder="Price per day (₹)"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basePrice: parseInt(e.target.value),
                    })
                  }
                  className="input-field"
                  required
                />

                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
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

              {/* Image Upload Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vehicle Images
                </label>

                {/* Image Preview Grid */}
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

                {/* Upload Button */}
                <div className="flex items-center gap-3 flex-wrap">
                  <label
                    className={`cursor-pointer flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-amber-500 transition ${uploadingImage ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <PhotoIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {uploadingImage
                        ? "Uploading..."
                        : editingVehicle
                          ? "Add New Photo"
                          : "Upload Image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    Max 5MB per image. First image will be the main display.
                  </p>
                </div>

                {formData.images.length === 0 && !editingVehicle && (
                  <p className="text-xs text-red-500 mt-2">
                    At least one image is required
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
