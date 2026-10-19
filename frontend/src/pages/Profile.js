import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";
import { PageHeader, Segmented } from "../components/ui";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || { street: "", city: "", state: "", pincode: "" },
    preferences: user?.preferences || {
      vehicleType: "any",
      fuelType: "any",
      maxBudget: 5000,
    },
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.user);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow="Account"
        title={["Your profile."]}
        actions={
          <Segmented
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { value: "profile", label: "Profile info" },
              { value: "password", label: "Password" },
            ]}
          />
        }
      />

      <div className="grid gap-12 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="flex items-center gap-5 lg:flex-col lg:items-start">
            <span className="display grid h-24 w-24 shrink-0 place-items-center rounded-full bg-accent text-4xl text-accent-ink">
              {user?.name?.[0]?.toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 className="display-tight text-3xl">{user?.name}</h2>
              <p className="mt-1 truncate text-muted">{user?.email}</p>
              <p className="eyebrow mt-3">Role · {user?.role}</p>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-8">
          {activeTab === "profile" && (
            <form onSubmit={handleProfileUpdate} className="space-y-12">
              <section>
                <p className="eyebrow mb-6 flex items-center gap-3"><span className="text-accent">(01)</span> Details</p>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <label className="field-label">Full name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="field"
                    />
                  </div>

                  <div>
                    <label className="field-label">Phone number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="field"
                    />
                  </div>

                  <div>
                    <label className="field-label">City</label>
                    <input
                      type="text"
                      value={formData.address?.city || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            city: e.target.value,
                          },
                        })
                      }
                      className="field"
                      placeholder="Your city"
                    />
                  </div>

                  <div>
                    <label className="field-label">State</label>
                    <input
                      type="text"
                      value={formData.address?.state || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value },
                        })
                      }
                      className="field"
                      placeholder="Your state"
                    />
                  </div>
                </div>
              </section>

              <section>
                <p className="eyebrow mb-6 flex items-center gap-3"><span className="text-accent">(02)</span> Preferences</p>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  <div>
                    <label className="field-label">Vehicle type</label>
                    <select
                      value={formData.preferences?.vehicleType || "any"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            vehicleType: e.target.value,
                          },
                        })
                      }
                      className="field [&>option]:bg-surface"
                    >
                      <option value="any">Any</option>
                      <option value="car">Car</option>
                      <option value="bike">Bike</option>
                    </select>
                  </div>

                  <div>
                    <label className="field-label">Fuel type</label>
                    <select
                      value={formData.preferences?.fuelType || "any"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            fuelType: e.target.value,
                          },
                        })
                      }
                      className="field [&>option]:bg-surface"
                    >
                      <option value="any">Any</option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                    </select>
                  </div>

                  <div>
                    <label className="field-label">Max budget (₹/day)</label>
                    <input
                      type="number"
                      value={formData.preferences?.maxBudget || 5000}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            maxBudget: parseInt(e.target.value),
                          },
                        })
                      }
                      className="field"
                    />
                  </div>
                </div>
              </section>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Saving…" : "Save changes"}
              </button>
            </form>
          )}

          {activeTab === "password" && (
            <form onSubmit={handlePasswordChange} className="max-w-md space-y-8">
              <p className="eyebrow flex items-center gap-3"><span className="text-accent">(01)</span> Change password</p>
              <div>
                <label className="field-label">Current password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="field"
                  required
                />
              </div>

              <div>
                <label className="field-label">New password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="field"
                  required
                />
              </div>

              <div>
                <label className="field-label">Confirm new password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="field"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Changing…" : "Change password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
