import React, { useState } from "react";

const EMPTY_ADDRESS = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
};

const inputClass =
  "rounded-md border border-text/15 bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary";

export default function ShippingAddressForm({ onSubmit, submitting }) {
  const [address, setAddress] = useState(EMPTY_ADDRESS);

  const handleChange = (field) => (e) => {
    setAddress((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(address);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-text/70">Full name *</span>
        <input
          type="text"
          required
          value={address.fullName}
          onChange={handleChange("fullName")}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-text/70">Address line 1 *</span>
        <input
          type="text"
          required
          value={address.line1}
          onChange={handleChange("line1")}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-text/70">Address line 2</span>
        <input
          type="text"
          value={address.line2}
          onChange={handleChange("line2")}
          className={inputClass}
        />
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-text/70">City *</span>
          <input
            type="text"
            required
            value={address.city}
            onChange={handleChange("city")}
            className={inputClass}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-text/70">State / Province</span>
          <input
            type="text"
            value={address.state}
            onChange={handleChange("state")}
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-text/70">Postal code *</span>
          <input
            type="text"
            required
            value={address.postalCode}
            onChange={handleChange("postalCode")}
            className={inputClass}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-text/70">Country *</span>
          <input
            type="text"
            required
            placeholder="e.g. US"
            value={address.country}
            onChange={handleChange("country")}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-text/70">Phone</span>
        <input
          type="tel"
          value={address.phone}
          onChange={handleChange("phone")}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-background hover:bg-secondary disabled:opacity-50"
      >
        {submitting ? "Preparing payment..." : "Continue to Payment"}
      </button>
    </form>
  );
}
