
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/emails";
  
function App() {
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    text: "",
    scheduledAt: "",
  });

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch emails from backend
 const fetchEmails = async () => {
  try {
    setRefreshing(true);
    
    const response = await axios.get(API_URL);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setEmails(response.data.emails);
  } catch (error) {
    console.error("Error fetching emails:", error.message);
  } finally {
    setRefreshing(false);
  }
};

  // Filter emails based on selected status
  const filteredEmails =
    filterStatus === "all"
      ? emails
      : emails.filter((email) => email.status === filterStatus);

  // Fetch emails when component loads
  useEffect(() => {
    fetchEmails();
  }, []);

  // Handle form inputs
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // Schedule email
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(`${API_URL}/schedule`, formData);

      setMessage(response.data.message);

      setFormData({
        to: "",
        subject: "",
        text: "",
        scheduledAt: "",
      });

      await fetchEmails();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to schedule email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">R</div>
          <h2>ReachInbox</h2>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <div className="nav-item active">
          <span>✉</span>
          Email Scheduler
        </div>

        <div className="sidebar-footer">
          <div className="avatar">T</div>

          <div>
            <strong>Tanisha</strong>
            <p>Developer</p>
          </div>
        </div>
      </aside>

      {/* Main Dashboard */}
      <main className="main-content">
        {/* Header */}
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Email Scheduler</p>
            <h1>Email Scheduler</h1>
          </div>

          <div className="status-badge">
            <span className="status-dot"></span>
            System Active
          </div>
        </header>

        {/* Welcome Section */}
        <section className="welcome-section">
          <div>
            <h2>Schedule your emails</h2>

            <p>
              Create and manage your scheduled emails from one place.
            </p>
          </div>
        </section>

        {/* Statistics */}
        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Emails</p>
            <h2>{emails.length}</h2>
          </div>

          <div className="stat-card">
            <p>Scheduled</p>

            <h2>
              {
                emails.filter(
                  (email) =>
                    email.status === "delayed" ||
                    email.status === "waiting"
                ).length
              }
            </h2>
          </div>

          <div className="stat-card">
            <p>Sent</p>

            <h2>
              {
                emails.filter(
                  (email) => email.status === "completed"
                ).length
              }
            </h2>
          </div>
        </section>

        {/* Main Content */}
        <section className="content-grid">
          {/* Compose Email Form */}
          <div className="panel form-panel">
            <div className="panel-heading">
              <div>
                <h3>Compose Email</h3>
                <p>Create a new scheduled email</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="to">Recipient Email</label>

              <input
                id="to"
                type="email"
                name="to"
                placeholder="recipient@example.com"
                value={formData.to}
                onChange={handleChange}
                required
              />

              <label htmlFor="subject">Subject</label>

              <input
                id="subject"
                type="text"
                name="subject"
                placeholder="Enter email subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />

              <label htmlFor="text">Message</label>

              <textarea
                id="text"
                name="text"
                placeholder="Write your email message..."
                rows="5"
                value={formData.text}
                onChange={handleChange}
                required
              />

              <label htmlFor="scheduledAt">
                Schedule Date & Time
              </label>

              <input
                id="scheduledAt"
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleChange}
                required
              />

              {message && (
                <div className="message">
                  {message}
                </div>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "Scheduling..." : "Schedule Email"}
              </button>
            </form>
          </div>

          {/* Email Activity */}
          <div className="panel emails-panel">
            <div className="panel-heading">
              <div>
                <h3>Email Activity</h3>
                <p>Your scheduled and processed emails</p>
              </div>

              <div className="activity-actions">
                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(event) =>
                    setFilterStatus(event.target.value)
                  }
                >
                  <option value="all">All Emails</option>
                  <option value="delayed">Scheduled</option>
                  <option value="waiting">Waiting</option>
                  <option value="active">Processing</option>
                  <option value="completed">Sent</option>
                  <option value="failed">Failed</option>
                </select>

                {/* Refresh Button */}
                <button
                className="refresh-button"
                type="button"
                onClick={fetchEmails}
                disabled={refreshing}
                >
                {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* Empty State */}
            {filteredEmails.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✉</div>

                <h3>No emails found</h3>

                <p>
                  Your emails will appear here based on the selected filter.
                </p>
              </div>
            ) : (
              /* Email List */
              <div className="email-list">
                {filteredEmails.map((email) => (
                  <div className="email-item" key={email.id}>
                    <div className="email-icon">✉</div>

                    <div className="email-details">
                      <h4>{email.subject}</h4>

                      <p>{email.to}</p>

                      <small>
                        {new Date(
                          email.scheduledAt
                        ).toLocaleString()}
                      </small>
                    </div>

                    <span
                      className={`email-status ${email.status}`}
                    >
                      {email.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
