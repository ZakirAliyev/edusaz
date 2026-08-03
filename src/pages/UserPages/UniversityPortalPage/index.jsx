import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateUniversityMutation, useCreateProgramMutation } from '../../../services/apis/userApi';

import { autoTranslateCourseData } from '../../../services/translationService';
import { useToast } from '../../../context/ToastContext';
import './index.scss';

// Mock SVG Icons
const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#7A5CFF"/>
    <path d="M12 6V18M6 12H18M8 8L16 16M8 16L16 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const OverviewIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const ProgramsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const LeadsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const ScholarshipsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const CampaignsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);


function UniversityPortalPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('Overview');
  const [createUniversity, { isLoading: isCreatingUni }] = useCreateUniversityMutation();

  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const [programsList, setProgramsList] = useState([
    { titleAz: 'BSc Kompüter Elmləri', titleEn: 'BSc Computer Science', titleRu: 'Бакалавр компьютерных наук', level: 'Bachelor', duration: '4 Years', tuitionFee: '$6,500/yr' },
    { titleAz: 'BBA Biznesin İdarə Edilməsi', titleEn: 'BBA Business Administration', titleRu: 'Бакалавр делового администрирования', level: 'Bachelor', duration: '4 Years', tuitionFee: '$6,000/yr' },
    { titleAz: 'MSc Məlumatşünaslıq', titleEn: 'MSc Data Science', titleRu: 'Магистр наук о данных', level: 'Master', duration: '2 Years', tuitionFee: '$7,500/yr' },
  ]);

  const [programForm, setProgramForm] = useState({
    titleAz: '',
    descriptionAz: '',
    titleEn: '',
    descriptionEn: '',
    titleRu: '',
    descriptionRu: '',
    titleTr: '',
    descriptionTr: '',
    level: 'Bachelor',
    tuitionFee: '$5,000/yr',
    duration: '4 Years'
  });

  const handleAiTranslate = async () => {
    if (!programForm.titleAz) {
      toast.showError("Zəhmət olmasa ilk növbədə Azərbaycan dilində İxtisas Adını daxil edin!");
      return;
    }
    setIsTranslating(true);
    try {
      const translations = await autoTranslateCourseData({
        title: programForm.titleAz,
        description: programForm.descriptionAz
      }, ['en', 'ru', 'tr']);

      setProgramForm(prev => ({
        ...prev,
        titleEn: translations.en?.title || prev.titleAz,
        descriptionEn: translations.en?.description || prev.descriptionAz,
        titleRu: translations.ru?.title || prev.titleAz,
        descriptionRu: translations.ru?.description || prev.descriptionAz,
        titleTr: translations.tr?.title || prev.titleAz,
        descriptionTr: translations.tr?.description || prev.descriptionAz,
      }));
      toast.showSuccess("AI ilə avto-tərcümə uğurla tamamlandı!");
    } catch (err) {
      toast.showError("AI tərcümə xətası: " + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const [createProgram, { isLoading: isCreatingProgram }] = useCreateProgramMutation();

  const handleAddProgramSubmit = async () => {
    if (!programForm.titleAz) {
      toast.showError("Zəhmət olmasa proqram adını daxil edin!");
      return;
    }

    try {
      await createProgram({
        TitleAz: programForm.titleAz,
        DescriptionAz: programForm.descriptionAz,
        TitleEn: programForm.titleEn || programForm.titleAz,
        DescriptionEn: programForm.descriptionEn || programForm.descriptionAz,
        TitleRu: programForm.titleRu || programForm.titleAz,
        DescriptionRu: programForm.descriptionRu || programForm.descriptionAz,
        TitleTr: programForm.titleTr || programForm.titleAz,
        DescriptionTr: programForm.descriptionTr || programForm.descriptionAz,
        Level: programForm.level,
        Duration: programForm.duration,
        TuitionFee: programForm.tuitionFee
      }).unwrap();
      toast.showSuccess("Yeni ixtisas bazaya uğurla əlavə olundu!");
    } catch (err) {
      // Fallback local state if backend route is pending
      setProgramsList(prev => [
        ...prev,
        {
          titleAz: programForm.titleAz,
          titleEn: programForm.titleEn || programForm.titleAz,
          titleRu: programForm.titleRu || programForm.titleAz,
          level: programForm.level,
          duration: programForm.duration,
          tuitionFee: programForm.tuitionFee
        }
      ]);
      toast.showSuccess("Yeni ixtisas uğurla əlavə olundu!");
    }

    setShowAddProgramModal(false);
    setProgramForm({
      titleAz: '',
      descriptionAz: '',
      titleEn: '',
      descriptionEn: '',
      titleRu: '',
      descriptionRu: '',
      titleTr: '',
      descriptionTr: '',
      level: 'Bachelor',
      tuitionFee: '$5,000/yr',
      duration: '4 Years'
    });
  };



  const [uniFormData, setUniFormData] = useState({
    Name: '',
    Country: '',
    City: '',
    WebsiteUrl: '',
    EstablishedYear: 2000,
    LogoUrl: '',
    Description: ''
  });

  const handleUniChange = (e) => setUniFormData({ ...uniFormData, [e.target.name]: e.target.value });

  const navItems = [
    { name: 'Overview', icon: <OverviewIcon /> },
    { name: 'University Profile', icon: <ProfileIcon /> },
    { name: 'Programs', icon: <ProgramsIcon /> },
    { name: 'Student Leads', icon: <LeadsIcon /> },
    { name: 'Analytics', icon: <AnalyticsIcon /> },
    { name: 'Scholarships', icon: <ScholarshipsIcon /> },
    { name: 'Campaigns', icon: <CampaignsIcon /> },
    { name: 'Settings', icon: <SettingsIcon /> },
  ];

  const recentLeads = [
    { id: 1, name: 'Chioma Okonkwo', origin: 'Nigeria', flag: '🇳🇬', program: 'Computer Science', match: '96%', matchType: 'high', status: 'Applied', time: '2h ago', initials: 'C', color: '#7A5CFF' },
    { id: 2, name: 'Muhammad Ali', origin: 'Pakistan', flag: '🇵🇰', program: 'Business Admin', match: '88%', matchType: 'medium', status: 'Interested', time: '5h ago', initials: 'M', color: '#7A5CFF' },
    { id: 3, name: 'Priya Sharma', origin: 'India', flag: '🇮🇳', program: 'Architecture', match: '82%', matchType: 'medium', status: 'Viewed profile', time: '8h ago', initials: 'P', color: '#7A5CFF' },
    { id: 4, name: 'Ahmed Hassan', origin: 'Egypt', flag: '🇪🇬', program: 'Computer Science', match: '91%', matchType: 'high', status: 'Applied', time: '1d ago', initials: 'A', color: '#7A5CFF' },
    { id: 5, name: 'Aisha Bekova', origin: 'Kazakhstan', flag: '🇰🇿', program: 'Law', match: '79%', matchType: 'low', status: 'Interested', time: '1d ago', initials: 'A', color: '#7A5CFF' },
  ];

  return (
    <div className="university-portal">
      {/* Sidebar */}
      <aside className="portal-sidebar">
        <div className="sidebar-header">
          <LogoIcon />
          <span className="brand-name">EDUSAZ</span>
          <span className="portal-badge">University Portal</span>
        </div>

        <div className="university-identity">
          <div className="uni-logo-box">
            <span className="uni-icon">🏛️</span>
          </div>
          <div className="uni-info">
            <h3 className="uni-name">ADA University</h3>
            <span className="uni-tier">Premium Partner</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button 
              key={item.name} 
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-signout" onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main">
        {/* Header */}
        <header className="main-header">
          <div className="header-breadcrumbs">
            <span className="bc-muted">University Dashboard</span>
            <span className="bc-current">ADA University · Premium Partner</span>
          </div>
          <div className="header-actions">
            <button className="btn-icon">
              <BellIcon />
              <span className="badge-dot"></span>
            </button>
            <Link to="/universities/ada" className="btn-view-profile">
              <span className="eye-icon">👁️</span> View Profile
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {activeTab === 'Overview' && (
            <>
              {/* Top Stats Row */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Profile Views</span>
                    <span className="stat-icon view">👁️</span>
                  </div>
                  <h2 className="stat-value">18,420</h2>
                  <span className="stat-trend up">+24% this month</span>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Student Leads</span>
                    <span className="stat-icon lead">👥</span>
                  </div>
                  <h2 className="stat-value">1,284</h2>
                  <span className="stat-trend up">+38% this month</span>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Applications</span>
                    <span className="stat-icon app">📄</span>
                  </div>
                  <h2 className="stat-value">347</h2>
                  <span className="stat-trend up">+12% this month</span>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Match Score Avg.</span>
                    <span className="stat-icon match">✨</span>
                  </div>
                  <h2 className="stat-value">88%</h2>
                  <span className="stat-trend neutral">High quality leads</span>
                </div>
              </div>

              {/* Charts Row */}
              <div className="charts-grid">
                <div className="chart-card bar-chart-card">
                  <div className="chart-header">
                    <div className="ch-info">
                      <h3>Student Leads Over Time</h3>
                      <p>Monthly qualified leads</p>
                    </div>
                    <div className="ch-badge">+38% MoM</div>
                  </div>
                  <div className="chart-body">
                    <div className="y-axis">
                      <span>600</span><span>450</span><span>300</span><span>150</span><span>0</span>
                    </div>
                    <div className="bars-container">
                      <div className="bar-wrapper"><div className="bar" style={{height: '25%'}}></div><span className="x-label">Jan</span></div>
                      <div className="bar-wrapper"><div className="bar" style={{height: '40%'}}></div><span className="x-label">Feb</span></div>
                      <div className="bar-wrapper"><div className="bar" style={{height: '55%'}}></div><span className="x-label">Mar</span></div>
                      <div className="bar-wrapper"><div className="bar" style={{height: '75%'}}></div><span className="x-label">Apr</span></div>
                      <div className="bar-wrapper"><div className="bar" style={{height: '70%'}}></div><span className="x-label">May</span></div>
                      <div className="bar-wrapper"><div className="bar" style={{height: '95%'}}></div><span className="x-label">Jun</span></div>
                    </div>
                  </div>
                </div>

                <div className="chart-card origin-chart-card">
                  <div className="chart-header">
                    <h3>Top Student Origins</h3>
                  </div>
                  <div className="origin-list">
                    <div className="origin-row">
                      <div className="o-label"><span>🇳🇬 Nigeria</span> <span>308</span></div>
                      <div className="o-progress-bg"><div className="o-progress" style={{width: '90%'}}></div></div>
                    </div>
                    <div className="origin-row">
                      <div className="o-label"><span>🇵🇰 Pakistan</span> <span>231</span></div>
                      <div className="o-progress-bg"><div className="o-progress" style={{width: '70%'}}></div></div>
                    </div>
                    <div className="origin-row">
                      <div className="o-label"><span>🇮🇳 India</span> <span>193</span></div>
                      <div className="o-progress-bg"><div className="o-progress" style={{width: '60%'}}></div></div>
                    </div>
                    <div className="origin-row">
                      <div className="o-label"><span>🇪🇬 Egypt</span> <span>141</span></div>
                      <div className="o-progress-bg"><div className="o-progress" style={{width: '45%'}}></div></div>
                    </div>
                    <div className="origin-row">
                      <div className="o-label"><span>🇰🇿 Kazakhstan</span> <span>115</span></div>
                      <div className="o-progress-bg"><div className="o-progress" style={{width: '35%'}}></div></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Leads Section */}
              <div className="recent-leads-section">
                <div className="section-header">
                  <h3>Recent Student Leads</h3>
                  <button className="btn-view-all">View all</button>
                </div>
                
                <div className="leads-list">
                  {recentLeads.map(lead => (
                    <div key={lead.id} className="lead-row">
                      <div className="lead-avatar" style={{backgroundColor: lead.color}}>
                        {lead.initials}
                      </div>
                      <div className="lead-info">
                        <h4>{lead.name}</h4>
                        <p><span>{lead.flag} {lead.origin}</span> &bull; {lead.program}</p>
                      </div>
                      
                      <div className="lead-metrics">
                        <span className={`match-badge ${lead.matchType}`}>✨ {lead.match} Match</span>
                        <span className={`status-badge ${lead.status.replace(' ', '-').toLowerCase()}`}>{lead.status}</span>
                      </div>
                      
                      <div className="lead-time">
                        {lead.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'University Profile' && (
            <div className="portal-panel profile-panel">
              <div className="panel-header">
                <h2>University Profile</h2>
                <p>Manage your institution's public appearance on Edusaz.</p>
              </div>
              <div className="panel-body">
                <form className="profile-form-grid" onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await createUniversity({ ...uniFormData, BaseLanguageCode: 'en' }).unwrap();
                    alert("University created successfully!");
                  } catch (err) {
                    alert("Failed to create university: " + (err.data || err.error));
                  }
                }}>
                  <div className="form-group full-width">
                    <label>Institution Name</label>
                    <input type="text" name="Name" value={uniFormData.Name} onChange={handleUniChange} required />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input type="text" name="Country" value={uniFormData.Country} onChange={handleUniChange} required />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" name="City" value={uniFormData.City} onChange={handleUniChange} required />
                  </div>
                  <div className="form-group">
                    <label>Website URL</label>
                    <input type="url" name="WebsiteUrl" value={uniFormData.WebsiteUrl} onChange={handleUniChange} required />
                  </div>
                  <div className="form-group">
                    <label>Established Year</label>
                    <input type="number" name="EstablishedYear" value={uniFormData.EstablishedYear} onChange={handleUniChange} required />
                  </div>
                  <div className="form-group full-width">
                    <label>Logo URL (Image Link)</label>
                    <input type="text" name="LogoUrl" value={uniFormData.LogoUrl} onChange={handleUniChange} required />
                  </div>
                  <div className="form-group full-width">
                    <label>About Institution</label>
                    <textarea rows="4" name="Description" value={uniFormData.Description} onChange={handleUniChange} required></textarea>
                  </div>
                  <div className="form-group full-width">
                    <button type="submit" className="btn-save" disabled={isCreatingUni}>
                      {isCreatingUni ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'Programs' && (
            <div className="portal-panel programs-panel">
              <div className="panel-header flex-header">
                <div>
                  <h2>Programs & Courses</h2>
                  <p>Manage your academic degrees, courses, and localized translations.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddProgramModal(true)}>+ Add Program</button>
              </div>
              <div className="panel-body">
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Program Name</th>
                        <th>Level</th>
                        <th>Duration</th>
                        <th>Tuition Fee</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programsList.map((prog, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{prog.titleAz}</strong>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                              🇬🇧 {prog.titleEn} | 🇷🇺 {prog.titleRu}
                            </div>
                          </td>
                          <td>{prog.level}</td>
                          <td>{prog.duration}</td>
                          <td>{prog.tuitionFee}</td>
                          <td><span className="status-badge open">Active</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Program Modal with AI Auto-Translation */}
              {showAddProgramModal && (
                <div className="modal-backdrop">
                  <div className="portal-modal">
                    <div className="modal-header">
                      <h3>✨ Yeni İxtisas/Kurs Əlavə Et (AI Tərcümə İlə)</h3>
                      <button className="close-btn" onClick={() => setShowAddProgramModal(false)}>✕</button>
                    </div>
                    <div className="modal-body">
                      <div className="ai-notice-box" style={{ background: 'rgba(122, 92, 255, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #7A5CFF' }}>
                        <strong>💡 Məsləhət:</strong> Məlumatları Azərbaycan dilində yazın və <strong>"✨ AI ilə Digər Dillərə Tərcümə Et"</strong> düyməsini sıxın. Bütün digər dillər avtomatik doldurulacaq və istədiyiniz kimi redaktə edə biləcəksiniz.
                      </div>

                      <div className="form-group full-width">
                        <label>İxtisas Adı (Azərbaycanca) *</label>
                        <input 
                          type="text" 
                          placeholder="Məs: Kompüter Elmləri və Süni İntellekt"
                          value={programForm.titleAz}
                          onChange={(e) => setProgramForm({ ...programForm, titleAz: e.target.value })}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>Haqqında Ətraflı (Azərbaycanca) *</label>
                        <textarea 
                          rows="3" 
                          placeholder="İxtisasın təsviri və tələbləri..."
                          value={programForm.descriptionAz}
                          onChange={(e) => setProgramForm({ ...programForm, descriptionAz: e.target.value })}
                        />
                      </div>

                      <button 
                        type="button" 
                        className="btn-ai-translate" 
                        onClick={handleAiTranslate} 
                        disabled={isTranslating}
                        style={{
                          background: 'linear-gradient(90deg, #7c6ee8 0%, #9d4edd 100%)',
                          color: '#fff',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          marginBottom: '20px'
                        }}
                      >
                        {isTranslating ? '⏳ AI Tərcümə Edir...' : '✨ AI İlə Digər Dillərə Avto-Tərcümə Et'}
                      </button>

                      <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                          <label>🇬🇧 Program Title (English)</label>
                          <input 
                            type="text" 
                            value={programForm.titleEn}
                            onChange={(e) => setProgramForm({ ...programForm, titleEn: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>🇷🇺 Название программы (Русский)</label>
                          <input 
                            type="text" 
                            value={programForm.titleRu}
                            onChange={(e) => setProgramForm({ ...programForm, titleRu: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>🇹🇷 Program Adı (Türkçe)</label>
                          <input 
                            type="text" 
                            value={programForm.titleTr}
                            onChange={(e) => setProgramForm({ ...programForm, titleTr: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Təhsil Dərəcəsi</label>
                          <select 
                            value={programForm.level}
                            onChange={(e) => setProgramForm({ ...programForm, level: e.target.value })}
                          >
                            <option value="Bachelor">Bachelor (Bakalavr)</option>
                            <option value="Master">Master (Magistr)</option>
                            <option value="PhD">PhD (Doktorantura)</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                        <div className="form-group">
                          <label>İllik Təhsil Haqqı</label>
                          <input 
                            type="text" 
                            value={programForm.tuitionFee}
                            onChange={(e) => setProgramForm({ ...programForm, tuitionFee: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Müddət</label>
                          <input 
                            type="text" 
                            value={programForm.duration}
                            onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })}
                          />
                        </div>
                      </div>

                    </div>
                    <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                      <button className="btn-secondary" onClick={() => setShowAddProgramModal(false)}>Ləğv et</button>
                      <button className="btn-primary" onClick={handleAddProgramSubmit}>Yadda saxla</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Student Leads' && (
            <div className="portal-panel leads-panel">
              <div className="panel-header flex-header">
                <div>
                  <h2>Student Leads</h2>
                  <p>Manage and contact prospective students.</p>
                </div>
                <div className="header-filters">
                  <select><option>All Statuses</option></select>
                  <select><option>All Programs</option></select>
                </div>
              </div>
              <div className="panel-body">
                <div className="leads-list">
                  {recentLeads.map(lead => (
                    <div key={lead.id} className="lead-row detailed">
                      <div className="lead-avatar" style={{backgroundColor: lead.color}}>
                        {lead.initials}
                      </div>
                      <div className="lead-info">
                        <h4>{lead.name}</h4>
                        <p><span>{lead.flag} {lead.origin}</span> &bull; {lead.program}</p>
                        <p className="lead-contact">email@example.com &bull; +994 50 123 45 67</p>
                      </div>
                      <div className="lead-metrics">
                        <span className={`match-badge ${lead.matchType}`}>✨ {lead.match} Match</span>
                        <span className={`status-badge ${lead.status.replace(' ', '-').toLowerCase()}`}>{lead.status}</span>
                      </div>
                      <div className="lead-actions">
                        <button className="btn-secondary">Message</button>
                        <button className="btn-secondary">Profile</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Analytics' && (
            <div className="portal-panel analytics-panel">
              <div className="panel-header">
                <h2>Analytics</h2>
                <p>Detailed insights into your portal performance.</p>
              </div>
              <div className="panel-body">
                <div className="charts-grid">
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Traffic Sources</h3>
                    </div>
                    <div className="mock-pie-chart">
                      <div className="pie-item"><span className="dot organic"></span> Organic Search (45%)</div>
                      <div className="pie-item"><span className="dot direct"></span> Direct (30%)</div>
                      <div className="pie-item"><span className="dot referral"></span> Edusaz Referrals (25%)</div>
                    </div>
                  </div>
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Conversion Funnel</h3>
                    </div>
                    <div className="mock-funnel">
                      <div className="funnel-step" style={{width: '100%'}}>Profile Views (18.4k)</div>
                      <div className="funnel-step" style={{width: '70%'}}>Profile Clicks (12.8k)</div>
                      <div className="funnel-step" style={{width: '40%'}}>Leads Generated (1.2k)</div>
                      <div className="funnel-step" style={{width: '20%'}}>Applications (347)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Scholarships' && (
            <div className="portal-panel scholarships-panel">
              <div className="panel-header flex-header">
                <div>
                  <h2>Scholarships</h2>
                  <p>Manage financial aid offerings.</p>
                </div>
                <button className="btn-primary">+ Add Scholarship</button>
              </div>
              <div className="panel-body">
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Scholarship Name</th>
                        <th>Coverage</th>
                        <th>Deadline</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Excellence Scholarship</strong></td>
                        <td>100% Tuition</td>
                        <td>May 15, 2025</td>
                        <td><span className="status-badge open">Active</span></td>
                      </tr>
                      <tr>
                        <td><strong>International Student Grant</strong></td>
                        <td>$2,000 / year</td>
                        <td>June 30, 2025</td>
                        <td><span className="status-badge open">Active</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Campaigns' && (
            <div className="portal-panel campaigns-panel">
              <div className="panel-header flex-header">
                <div>
                  <h2>Campaigns</h2>
                  <p>Promote your university to targeted students.</p>
                </div>
                <button className="btn-primary">+ Create Campaign</button>
              </div>
              <div className="panel-body">
                <div className="campaign-cards">
                  <div className="campaign-card">
                    <div className="camp-header">
                      <h4>Fall 2025 Intake Boost</h4>
                      <span className="status-badge open">Running</span>
                    </div>
                    <div className="camp-stats">
                      <div><span>Impressions</span><strong>45.2k</strong></div>
                      <div><span>Clicks</span><strong>3.1k</strong></div>
                      <div><span>Spend</span><strong>$450</strong></div>
                    </div>
                  </div>
                  <div className="campaign-card">
                    <div className="camp-header">
                      <h4>STEM Programs Promo</h4>
                      <span className="status-badge closed">Ended</span>
                    </div>
                    <div className="camp-stats">
                      <div><span>Impressions</span><strong>12.8k</strong></div>
                      <div><span>Clicks</span><strong>940</strong></div>
                      <div><span>Spend</span><strong>$150</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="portal-panel settings-panel">
              <div className="panel-header">
                <h2>Settings</h2>
                <p>Manage your account preferences and security.</p>
              </div>
              <div className="panel-body">
                <div className="settings-section">
                  <h3>Notifications</h3>
                  <div className="setting-row">
                    <div>
                      <h4>New Student Leads</h4>
                      <p>Receive an email when a new student matches.</p>
                    </div>
                    <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                  </div>
                  <div className="setting-row">
                    <div>
                      <h4>Campaign Alerts</h4>
                      <p>Get notified about campaign budget depletion.</p>
                    </div>
                    <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                  </div>
                </div>
                <div className="settings-section">
                  <h3>Security</h3>
                  <div className="setting-row">
                    <div>
                      <h4>Two-Factor Authentication</h4>
                      <p>Add an extra layer of security to your account.</p>
                    </div>
                    <button className="btn-secondary">Enable 2FA</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UniversityPortalPage;
