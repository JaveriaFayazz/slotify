"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import {
  Business,
  getMyBusinesses,
  updateBusiness,
} from "../../../services/business.service";

import {
  getStoredUser,
  logout,
  User,
} from "../../../services/auth.service";

export default function ManageBusinessPage() {
  const params = useParams();
  const router = useRouter();

  const businessId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      setError("Please log in first.");
      setLoading(false);
      return;
    }

    setUser(storedUser);

    if (storedUser.role !== "OWNER") {
      setError(
        "This page is only available to business owners."
      );
      setLoading(false);
      return;
    }

    loadBusiness();
  }, [businessId]);

  async function loadBusiness() {
    try {
      setLoading(true);
      setError("");

      const businesses = await getMyBusinesses();

      const foundBusiness = businesses.find(
        (item) => item.id === businessId
      );

      if (!foundBusiness) {
        setError(
          "Business not found or you do not have permission to manage it."
        );
        return;
      }

      setBusiness(foundBusiness);

      setName(foundBusiness.name);
      setDescription(foundBusiness.description);
      setLocation(foundBusiness.location);
      setCategory(foundBusiness.category);
    } catch (err) {
      console.error("Failed to load business:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load business."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveChanges(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !name.trim() ||
      !description.trim() ||
      !location.trim() ||
      !category.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);

      const updatedBusiness = await updateBusiness(
        businessId,
        {
          name: name.trim(),
          description: description.trim(),
          location: location.trim(),
          category: category.trim(),
        }
      );

      setBusiness(updatedBusiness);

      setSuccess(
        "Business information updated successfully."
      );
    } catch (err) {
      console.error("Update business error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update business."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="manage-business-page">
        <div className="manage-loading">
          Loading business...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="manage-business-page">
        <div className="manage-message error">
          {error || "Please log in first."}
        </div>
      </main>
    );
  }

  if (user.role !== "OWNER") {
    return (
      <main className="manage-business-page">

        <nav className="manage-navbar">

          <Link href="/" className="manage-logo">
            Slotify
          </Link>

          <div className="manage-nav-links">

            <Link href="/dashboard">
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="manage-logout"
            >
              Logout
            </button>

          </div>

        </nav>

        <div className="manage-message error">
          This page is only available to business owners.
        </div>

      </main>
    );
  }

  if (!business) {
    return (
      <main className="manage-business-page">

        <nav className="manage-navbar">

          <Link href="/" className="manage-logo">
            Slotify
          </Link>

          <div className="manage-nav-links">

            <Link href="/dashboard">
              Dashboard
            </Link>

            <Link href="/owner/businesses">
              My Businesses
            </Link>

            <button
              onClick={handleLogout}
              className="manage-logout"
            >
              Logout
            </button>

          </div>

        </nav>

        <section className="manage-content">

          <div className="manage-message error">
            {error || "Business not found."}
          </div>

          <Link
            href="/owner/businesses"
            className="back-business-button"
          >
            ← Back to My Businesses
          </Link>

        </section>

      </main>
    );
  }

  return (
    <main className="manage-business-page">

      {/* NAVBAR */}

      <nav className="manage-navbar">

        <Link href="/" className="manage-logo">
          Slotify
        </Link>

        <div className="manage-nav-links">

          <Link href="/dashboard">
            Dashboard
          </Link>

          <Link href="/owner/businesses">
            My Businesses
          </Link>

          <Link href="/owner/services">
            Services
          </Link>

          <button
            onClick={handleLogout}
            className="manage-logout"
          >
            Logout
          </button>

        </div>

      </nav>

      {/* PAGE CONTENT */}

      <section className="manage-content">

        <Link
          href="/owner/businesses"
          className="back-link"
        >
          ← Back to My Businesses
        </Link>

        {/* HEADER */}

        <div className="manage-header">

          <div>

            <span className="manage-eyebrow">
              BUSINESS MANAGEMENT
            </span>

            <h1>
              {business.name}
            </h1>

            <p>
              Update your business information and
              keep your Slotify listing accurate.
            </p>

          </div>

          <div className="manage-business-icon">
            🏢
          </div>

        </div>

        {/* MAIN GRID */}

        <div className="manage-grid">

          {/* BUSINESS DETAILS */}

          <div className="manage-form-card">

            <div className="manage-card-heading">

              <span className="manage-card-icon">
                ✏️
              </span>

              <div>
                <h2>
                  Business Information
                </h2>

                <p>
                  Update the details customers see.
                </p>
              </div>

            </div>

            <form onSubmit={handleSaveChanges}>

              <div className="manage-form-group">

                <label htmlFor="business-name">
                  Business Name
                </label>

                <input
                  id="business-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Business name"
                />

              </div>

              <div className="manage-form-group">

                <label htmlFor="business-description">
                  Description
                </label>

                <textarea
                  id="business-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe your business..."
                  rows={6}
                />

              </div>

              <div className="manage-form-row">

                <div className="manage-form-group">

                  <label htmlFor="business-location">
                    Location
                  </label>

                  <input
                    id="business-location"
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="Business location"
                  />

                </div>

                <div className="manage-form-group">

                  <label htmlFor="business-category">
                    Category
                  </label>

                  <input
                    id="business-category"
                    type="text"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                    placeholder="Business category"
                  />

                </div>

              </div>

              {error && (
                <div className="manage-form-message error">
                  {error}
                </div>
              )}

              {success && (
                <div className="manage-form-message success">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="save-business-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes →"}
              </button>

            </form>

          </div>

          {/* QUICK ACTIONS */}

          <div className="manage-side-column">

            <div className="manage-info-card">

              <span className="manage-side-icon">
                🏷️
              </span>

              <h3>
                Business Category
              </h3>

              <div className="manage-category">
                {business.category}
              </div>

              <p>
                Your category helps customers understand
                what type of business you operate.
              </p>

            </div>

            <div className="manage-info-card">

              <span className="manage-side-icon">
                📍
              </span>

              <h3>
                Business Location
              </h3>

              <p className="manage-location-text">
                {business.location}
              </p>

              <p>
                Customers can use this information
                to identify where your business operates.
              </p>

            </div>

            <div className="manage-services-card">

              <div className="manage-services-icon">
                ⚙️
              </div>

              <h3>
                Manage Services
              </h3>

              <p>
                Add and manage the services that
                customers can book at this business.
              </p>

              <Link
                href="/owner/services"
                className="manage-services-button"
              >
                Manage Services →
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}