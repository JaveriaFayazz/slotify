"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import {
  Business,
  getMyBusinesses,
} from "../../services/business.service";

import {
  getStoredUser,
  logout,
  User,
} from "../../services/auth.service";

import {
  Service,
  createService,
  deleteService,
  getMyServices,
  updateService,
} from "../../services/service.service";

export default function ServicesPage() {
  const [user, setUser] = useState<User | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");

  const [services, setServices] = useState<Service[]>([]);

  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(
    null
  );

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      setError("Please log in first.");
      setLoadingBusinesses(false);
      return;
    }

    setUser(storedUser);

    if (storedUser.role !== "OWNER") {
      setError("This page is only available to business owners.");
      setLoadingBusinesses(false);
      return;
    }

    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      setLoadingBusinesses(true);
      setError("");

      const data = await getMyBusinesses();

      setBusinesses(data);

      if (data.length > 0) {
        setSelectedBusinessId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load businesses:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load businesses."
      );
    } finally {
      setLoadingBusinesses(false);
    }
  }

  useEffect(() => {
    if (!selectedBusinessId) {
      setServices([]);
      return;
    }

    loadServices(selectedBusinessId);
  }, [selectedBusinessId]);

  async function loadServices(businessId: string) {
    try {
      setLoadingServices(true);
      setError("");

      const data = await getMyServices(businessId);

      setServices(data);
    } catch (err) {
      console.error("Failed to load services:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load services."
      );
    } finally {
      setLoadingServices(false);
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setDuration("");
    setPrice("");
    setEditingServiceId(null);
    setShowForm(false);
  }

  function openAddForm() {
    setError("");
    setSuccess("");

    setName("");
    setDescription("");
    setDuration("");
    setPrice("");

    setEditingServiceId(null);
    setShowForm(true);
  }

  function openEditForm(service: Service) {
    setError("");
    setSuccess("");

    setName(service.name);
    setDescription(service.description);
    setDuration(String(service.duration));
    setPrice(String(service.price));

    setEditingServiceId(service.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedBusinessId) {
      setError("Please select a business.");
      return;
    }

    if (
      !name.trim() ||
      !description.trim() ||
      !duration.trim() ||
      !price.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const durationNumber = Number(duration);
    const priceNumber = Number(price);

    if (
      !Number.isFinite(durationNumber) ||
      durationNumber <= 0
    ) {
      setError("Duration must be a number greater than 0.");
      return;
    }

    if (
      !Number.isFinite(priceNumber) ||
      priceNumber < 0
    ) {
      setError("Price must be a valid number.");
      return;
    }

    try {
      setSaving(true);

      if (editingServiceId) {
        // UPDATE SERVICE
        // businessId is required by the backend
        const updatedService = await updateService(
          editingServiceId,
          {
            businessId: selectedBusinessId,
            name: name.trim(),
            description: description.trim(),
            duration: durationNumber,
            price: priceNumber,
          }
        );

        setServices((currentServices) =>
          currentServices.map((service) =>
            service.id === editingServiceId
              ? updatedService
              : service
          )
        );

        setSuccess("Service updated successfully.");
      } else {
        // CREATE SERVICE
        const newService = await createService({
          businessId: selectedBusinessId,
          name: name.trim(),
          description: description.trim(),
          duration: durationNumber,
          price: priceNumber,
        });

        setServices((currentServices) => [
          ...currentServices,
          newService,
        ]);

        setSuccess("Service added successfully.");
      }

      setName("");
      setDescription("");
      setDuration("");
      setPrice("");
      setEditingServiceId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Save service error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save service."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(service: Service) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteService(service.id);

      setServices((currentServices) =>
        currentServices.filter(
          (item) => item.id !== service.id
        )
      );

      setSuccess("Service deleted successfully.");
    } catch (err) {
      console.error("Delete service error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete service."
      );
    }
  }

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  const selectedBusiness = businesses.find(
    (business) => business.id === selectedBusinessId
  );

  if (loadingBusinesses) {
    return (
      <main className="owner-services-page">
        <div className="services-loading">
          Loading services...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="owner-services-page">
        <div className="services-message error">
          {error || "Please log in first."}
        </div>
      </main>
    );
  }

  if (user.role !== "OWNER") {
    return (
      <main className="owner-services-page">
        <nav className="services-navbar">
          <Link
            href="/"
            className="services-logo"
          >
            Slotify
          </Link>

          <div className="services-nav-links">
            <Link href="/dashboard">
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="services-logout"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="services-message error">
          This page is only available to business owners.
        </div>
      </main>
    );
  }

  return (
    <main className="owner-services-page">
      {/* NAVBAR */}

      <nav className="services-navbar">
        <Link
          href="/"
          className="services-logo"
        >
          Slotify
        </Link>

        <div className="services-nav-links">
          <Link href="/dashboard">
            Dashboard
          </Link>

          <Link href="/owner/businesses">
            My Businesses
          </Link>

          <Link
            href="/owner/services"
            className="active"
          >
            Services
          </Link>

          <button
            onClick={handleLogout}
            className="services-logout"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}

      <section className="services-content">
        <div className="services-hero">
          <div>
            <span className="services-eyebrow">
              BUSINESS OWNER
            </span>

            <h1>
              Services
            </h1>

            <p>
              Add and manage the services your
              businesses offer to customers.
            </p>
          </div>

          <div className="services-hero-icon">
            ⚙️
          </div>
        </div>

        {/* BUSINESS SELECTOR */}

        <div className="business-selector-card">
          <div>
            <span className="selector-label">
              SELECT BUSINESS
            </span>

            <h2>
              Which business are you managing?
            </h2>

            <p>
              Choose a business to view and manage
              its services.
            </p>
          </div>

          {businesses.length > 0 ? (
            <select
              value={selectedBusinessId}
              onChange={(event) => {
                setSelectedBusinessId(
                  event.target.value
                );
                setShowForm(false);
                setEditingServiceId(null);
                setSuccess("");
                setError("");
              }}
              className="business-selector"
            >
              {businesses.map((business) => (
                <option
                  key={business.id}
                  value={business.id}
                >
                  {business.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="no-business-selected">
              You don't have any businesses yet.
            </div>
          )}
        </div>

        {businesses.length === 0 ? (
          <div className="empty-business-card">
            <div className="empty-icon">
              🏢
            </div>

            <h2>
              Create a business first
            </h2>

            <p>
              You need to create a business before
              you can add services.
            </p>

            <Link
              href="/owner/businesses"
              className="primary-services-button"
            >
              Go to My Businesses →
            </Link>
          </div>
        ) : (
          <>
            {/* CURRENT BUSINESS */}

            {selectedBusiness && (
              <div className="selected-business-banner">
                <div className="selected-business-icon">
                  🏢
                </div>

                <div>
                  <span>
                    MANAGING SERVICES FOR
                  </span>

                  <h2>
                    {selectedBusiness.name}
                  </h2>

                  <p>
                    {selectedBusiness.category}
                    {" • "}
                    {selectedBusiness.location}
                  </p>
                </div>
              </div>
            )}

            {/* ADD SERVICE BUTTON */}

            <div className="services-section-header">
              <div>
                <span className="services-section-eyebrow">
                  YOUR SERVICES
                </span>

                <h2>
                  Services You Offer
                </h2>
              </div>

              <button
                onClick={openAddForm}
                className="add-service-button"
              >
                + Add Service
              </button>
            </div>

            {/* FORM */}

            {showForm && (
              <div className="service-form-card">
                <div className="service-form-heading">
                  <div className="service-form-icon">
                    {editingServiceId
                      ? "✏️"
                      : "➕"}
                  </div>

                  <div>
                    <h2>
                      {editingServiceId
                        ? "Edit Service"
                        : "Add New Service"}
                    </h2>

                    <p>
                      {editingServiceId
                        ? "Update the details of this service."
                        : "Add a service that customers can book."}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="service-form-group">
                    <label htmlFor="service-name">
                      Service Name
                    </label>

                    <input
                      id="service-name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="e.g. Personal Training Session"
                    />
                  </div>

                  <div className="service-form-group">
                    <label htmlFor="service-description">
                      Description
                    </label>

                    <textarea
                      id="service-description"
                      value={description}
                      onChange={(event) =>
                        setDescription(
                          event.target.value
                        )
                      }
                      placeholder="Describe what this service includes..."
                      rows={5}
                    />
                  </div>

                  <div className="service-form-row">
                    <div className="service-form-group">
                      <label htmlFor="service-duration">
                        Duration
                      </label>

                      <div className="input-with-unit">
                        <input
                          id="service-duration"
                          type="number"
                          min="1"
                          value={duration}
                          onChange={(event) =>
                            setDuration(
                              event.target.value
                            )
                          }
                          placeholder="60"
                        />

                        <span>
                          minutes
                        </span>
                      </div>
                    </div>

                    <div className="service-form-group">
                      <label htmlFor="service-price">
                        Price
                      </label>

                      <div className="input-with-unit">
                        <span className="price-prefix">
                          Rs.
                        </span>

                        <input
                          id="service-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={price}
                          onChange={(event) =>
                            setPrice(
                              event.target.value
                            )
                          }
                          placeholder="2000"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="service-form-message error">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="service-form-message success">
                      {success}
                    </div>
                  )}

                  <div className="service-form-actions">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="cancel-service-button"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="save-service-button"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editingServiceId
                        ? "Update Service →"
                        : "Add Service →"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SUCCESS / ERROR */}

            {!showForm && error && (
              <div className="services-message error">
                {error}
              </div>
            )}

            {!showForm && success && (
              <div className="services-message success">
                {success}
              </div>
            )}

            {/* SERVICES */}

            {loadingServices ? (
              <div className="services-loading-card">
                Loading your services...
              </div>
            ) : services.length === 0 ? (
              <div className="empty-services-card">
                <div className="empty-icon">
                  🛠️
                </div>

                <h2>
                  No services yet
                </h2>

                <p>
                  Add your first service so customers
                  can book appointments with your
                  business.
                </p>

                <button
                  onClick={openAddForm}
                  className="primary-services-button"
                >
                  + Add Your First Service
                </button>
              </div>
            ) : (
              <div className="services-grid">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="service-card"
                  >
                    <div className="service-card-top">
                      <div className="service-card-icon">
                        ⚙️
                      </div>

                      <div className="service-card-actions">
                        <button
                          onClick={() =>
                            openEditForm(service)
                          }
                          className="edit-service-button"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(service)
                          }
                          className="delete-service-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <h3>
                      {service.name}
                    </h3>

                    <p className="service-description">
                      {service.description}
                    </p>

                    <div className="service-details">
                      <div className="service-detail">
                        <span>
                          ⏱️
                        </span>

                        <div>
                          <small>
                            Duration
                          </small>

                          <strong>
                            {service.duration} minutes
                          </strong>
                        </div>
                      </div>

                      <div className="service-detail">
                        <span>
                          💰
                        </span>

                        <div>
                          <small>
                            Price
                          </small>

                          <strong>
                            Rs.{" "}
                            {Number(
                              service.price
                            ).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}