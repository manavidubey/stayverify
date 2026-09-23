'use client';
import { useState } from 'react';
import styles from './page.module.css';
import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrls: '',
    domain: '',
    price: '',
    location: '',
    reviews: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        imageUrls: formData.imageUrls.split('\\n').filter(url => url.trim() !== ''),
        reviews: formData.reviews.split('\\n').filter(rev => rev.trim() !== ''),
      };

      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to verify listing');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColorClass = (score) => {
    if (score < 0.3) return styles.lowRisk;
    if (score < 0.7) return styles.medRisk;
    return styles.highRisk;
  };

  const getRiskColorHex = (score) => {
    if (score < 0.3) return '#4ade80';
    if (score < 0.7) return '#facc15';
    return '#f87171';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>StayVerify</h1>
        <p className={styles.subtitle}>Hotel Listing Scam & Authenticity Detector</p>
      </header>

      <main className={styles.main}>
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Listing Title</label>
              <input type="text" name="title" className={styles.input} value={formData.title} onChange={handleChange} placeholder="e.g. Luxury Beachfront Resort" required />
            </div>
            <div className={styles.formGroup}>
              <label>Listing Description (Optional)</label>
              <textarea name="description" className={styles.textarea} value={formData.description} onChange={handleChange} placeholder="Listing description text..."></textarea>
            </div>
            <div className={styles.formGroup}>
              <label>Image URLs (one per line)</label>
              <textarea name="imageUrls" className={styles.textarea} value={formData.imageUrls} onChange={handleChange} placeholder="https://example.com/image1.jpg"></textarea>
            </div>
            <div className={styles.formGroup}>
              <label>Domain or Host URL</label>
              <input type="text" name="domain" className={styles.input} value={formData.domain} onChange={handleChange} placeholder="e.g. beachfront-resorts-booking.com" />
            </div>
            <div className={styles.formGroup}>
              <label>Price (per night)</label>
              <input type="number" name="price" className={styles.input} value={formData.price} onChange={handleChange} placeholder="250" required />
            </div>
            <div className={styles.formGroup}>
              <label>Location</label>
              <input type="text" name="location" className={styles.input} value={formData.location} onChange={handleChange} placeholder="e.g. Miami, FL" required />
            </div>
            <div className={styles.formGroup}>
              <label>Reviews (one per line)</label>
              <textarea name="reviews" className={styles.textarea} value={formData.reviews} onChange={handleChange} placeholder="Paste review text here..."></textarea>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Analyzing Listing...' : 'Verify Listing'}
            </button>
          </form>
          {error && <p style={{color: '#f87171', marginTop: '15px'}}>{error}</p>}
        </div>

        {result && (
          <div className={styles.resultCard}>
            <div className={styles.riskMeter}>
              <h2>Risk Score</h2>
              <div className={`${styles.riskScore} ${getRiskColorClass(result.decision.scam_risk?.score || 0)}`}>
                {Math.round((result.decision.scam_risk?.score || 0) * 100)}%
              </div>
              <div className={styles.meterContainer}>
                <div 
                  className={styles.meterFill} 
                  style={{ 
                    width: `${Math.round((result.decision.scam_risk?.score || 0) * 100)}%`,
                    backgroundColor: getRiskColorHex(result.decision.scam_risk?.score || 0)
                  }}
                ></div>
              </div>
            </div>

            {result.decision.needs_human_review && (
              <div className={styles.reviewBadge}>
                <AlertTriangle size={20} />
                ⚠️ Uncertain — recommend manual review
              </div>
            )}

            {result.decision.primary_red_flag?.choice !== 'none_significant' ? (
              <div className={styles.redFlag}>
                <h4>Primary Concern</h4>
                <p>{result.decision.primary_red_flag?.choice.replace(/_/g, ' ').toUpperCase()}</p>
              </div>
            ) : (
              <div className={styles.redFlag} style={{ borderLeftColor: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.1)' }}>
                <h4 style={{color: '#86efac'}}>Status</h4>
                <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}><ShieldCheck size={24} color="#4ade80" /> No strong red flags detected</p>
              </div>
            )}

            <div className={styles.signals}>
              <h3>Signal Breakdown</h3>
              <div className={styles.signalItem}>
                <span className={styles.signalLabel}>Reverse Image Match</span>
                <span className={styles.signalValue}>{result.state.reverse_image_match_found === null ? 'Not Checked' : (result.state.reverse_image_match_found ? 'Found' : 'Clear')}</span>
              </div>
              <div className={styles.signalItem}>
                <span className={styles.signalLabel}>Domain Age</span>
                <span className={styles.signalValue}>{result.state.domain_age_days === null ? 'Not Available' : `${result.state.domain_age_days} days`}</span>
              </div>
              <div className={styles.signalItem}>
                <span className={styles.signalLabel}>Price Deviation</span>
                <span className={styles.signalValue}>{result.state.price_deviation_from_market_pct === null ? 'Not Available' : `${result.state.price_deviation_from_market_pct}%`}</span>
              </div>
              <div className={styles.signalItem}>
                <span className={styles.signalLabel}>Urgency Language</span>
                <span className={styles.signalValue}>{result.state.urgency_language_detected === null ? 'Not Checked' : (result.state.urgency_language_detected ? 'Detected' : 'None')}</span>
              </div>
              <div className={styles.signalItem}>
                <span className={styles.signalLabel}>Review Similarity</span>
                <span className={styles.signalValue}>{result.state.review_text_similarity_score === null ? 'Not Checked' : `${Math.round(result.state.review_text_similarity_score * 100)}%`}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
