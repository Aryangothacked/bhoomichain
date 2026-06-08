
import { useState, type ChangeEvent, type FormEvent } from 'react';
import client from '../api/client';
import { formatIndianCurrency } from '../utils/formatters';
import { Spinner } from '../components/ui';
import { Box, User, CreditCard, MapPin, Ruler, Navigation, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_PROPERTIES = [
  { label: 'Mumbai North Commercial', city: 'Mumbai', type: 'commercial', area: 5000, value: 75000000, survey: 'MUM-991', khasra: 'KH-102' },
  { label: 'Delhi Residential Plot', city: 'Delhi', type: 'residential', area: 2400, value: 30000000, survey: 'DEL-442', khasra: 'KH-88' },
  { label: 'Bangalore IT Office', city: 'Bangalore', type: 'commercial', area: 15000, value: 120000000, survey: 'BLR-123', khasra: 'KH-554' },
];

export default function Register() {
  const [tab, setTab] = useState<'manual' | 'demo'>('manual');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: '',
    panNumber: '',
    aadhaarLast4: '',
    propertyType: 'residential',
    city: 'Mumbai',
    surveyNo: '',
    khasraNo: '',
    area: '',
    declaredValue: '',
    latitude: '',
    longitude: '',
    notes: ''
  });

  const CIRCLE_RATES: Record<string, number> = {
    'Mumbai': 15000,
    'Delhi': 12000,
    'Bangalore': 8000,
    'Hyderabad': 6000,
    'Chennai': 7000
  };

  const currentCircleRate = CIRCLE_RATES[formData.city] || 5000;
  const minValue = formData.area ? Number(formData.area) * currentCircleRate : 0;
  const isValueValid = Number(formData.declaredValue) >= minValue;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDemoSelect = (property: typeof DEMO_PROPERTIES[0]) => {
    setFormData({
      ...formData,
      ownerName: 'Sunil Lalwani',
      panNumber: 'ABCDE1234F',
      aadhaarLast4: '9876',
      city: property.city,
      propertyType: property.type as any,
      area: property.area.toString(),
      declaredValue: property.value.toString(),
      surveyNo: property.survey,
      khasraNo: property.khasra,
      latitude: '19.0760',
      longitude: '72.8777',
      notes: `Demo registration for ${property.label}`
    });
    setTab('manual');
    toast.success('Fields populated with demo data');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValueValid) {
      toast.error('Registration rejected: Declared value is below the minimum circle rate');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Mining block...');
    try {
      const response = await client.post('/transactions/register', {
        ...formData,
        area: Number(formData.area),
        declaredValue: Number(formData.declaredValue),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      });
      toast.dismiss(loadingToast);
      if (response.data.success) {
        toast.success(`Property registered! Block #${response.data.block.blockNumber} added to chain.`);
        // Reset form
        setFormData({
          ownerName: '', panNumber: '', aadhaarLast4: '', propertyType: 'residential',
          city: 'Mumbai', surveyNo: '', khasraNo: '', area: '', declaredValue: '',
          latitude: '', longitude: '', notes: ''
        });
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error('Registration rejected: ' + (err.response?.data?.error || 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeInUp 0.3s ease forwards' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Register New Property</h1>
        <p style={{ color: '#64748B', fontSize: '15px' }}>Submit a property to the BhoomiChain ledger</p>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${tab === 'manual' ? 'active' : ''}`} 
          onClick={() => setTab('manual')}
        >
          Manual Entry
        </button>
        <button 
          className={`tab-btn ${tab === 'demo' ? 'active' : ''}`} 
          onClick={() => setTab('demo')}
        >
          Demo Mode
        </button>
      </div>

      {tab === 'demo' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_PROPERTIES.map((p, i) => (
            <div key={i} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} 
              onClick={() => handleDemoSelect(p)}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Box size={24} color="#1B4F8A" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{p.label}</h4>
              <p style={{ fontSize: '12px', color: '#64748B' }}>{p.city} • {p.type}</p>
              <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: 600, color: '#1B4F8A' }}>
                {formatIndianCurrency(p.value)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="label"><User size={14} style={{ marginRight: '6px' }} /> Owner Name</label>
              <input className="input" name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="Full name as per Aadhaar" />
            </div>
            <div className="form-group">
              <label className="label"><CreditCard size={14} style={{ marginRight: '6px' }} /> PAN Number</label>
              <input className="input" name="panNumber" value={formData.panNumber} onChange={handleChange} required placeholder="ABCDE1234F" maxLength={10} />
            </div>
            <div className="form-group">
              <label className="label">Aadhaar Last 4</label>
              <input className="input" name="aadhaarLast4" value={formData.aadhaarLast4} onChange={handleChange} required placeholder="XXXX" maxLength={4} />
            </div>
            <div className="form-group">
              <label className="label">Property Type</label>
              <select className="input" name="propertyType" value={formData.propertyType} onChange={handleChange}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agricultural">Agricultural</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label"><MapPin size={14} style={{ marginRight: '6px' }} /> City</label>
              <select className="input" name="city" value={formData.city} onChange={handleChange}>
                {Object.keys(CIRCLE_RATES).map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Survey Number</label>
              <input className="input" name="surveyNo" value={formData.surveyNo} onChange={handleChange} required placeholder="e.g. MUM-101" />
            </div>
            <div className="form-group">
              <label className="label">Khasra Number</label>
              <input className="input" name="khasraNo" value={formData.khasraNo} onChange={handleChange} required placeholder="e.g. KH-442" />
            </div>
            <div className="form-group">
              <label className="label"><Ruler size={14} style={{ marginRight: '6px' }} /> Area (sq ft)</label>
              <input className="input" type="number" name="area" value={formData.area} onChange={handleChange} required placeholder="Total area in SqFt" />
            </div>
            
            <div className="form-group full-width">
              <label className="label"><CreditCard size={14} style={{ marginRight: '6px' }} /> Declared Value (₹)</label>
              <input className="input" type="number" name="declaredValue" value={formData.declaredValue} onChange={handleChange} required placeholder="Agreement value" />
              
              <div style={{ 
                marginTop: '12px', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: formData.area ? (isValueValid ? '#DEF7EC' : '#FDE8E8') : '#F8FAFC',
                color: formData.area ? (isValueValid ? '#03543F' : '#9B1C1C') : '#64748B',
                border: '1px solid currentColor',
                opacity: 0.8
              }}>
                <div>
                  <strong>Circle Rate:</strong> {formatIndianCurrency(currentCircleRate)}/sqft | 
                  <strong> Minimum Value:</strong> {formatIndianCurrency(minValue)}
                </div>
                {formData.area && formData.declaredValue && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                    {isValueValid ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {isValueValid ? '✓ Value meets circle rate requirement' : '✗ Below minimum. This transaction will be rejected.'}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="label"><Navigation size={14} style={{ marginRight: '6px' }} /> GPS Latitude</label>
              <input className="input" type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} required placeholder="e.g. 19.0760" />
            </div>
            <div className="form-group">
              <label className="label"><Navigation size={14} style={{ marginRight: '6px' }} /> GPS Longitude</label>
              <input className="input" type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} required placeholder="e.g. 72.8777" />
            </div>
            <div className="form-group full-width">
              <label className="label"><FileText size={14} style={{ marginRight: '6px' }} /> Additional Notes</label>
              <textarea className="textarea" name="notes" value={formData.notes} onChange={handleChange} placeholder="Physical landmarks, boundary descriptions, etc."></textarea>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '12px' }}>
            {loading ? <Spinner /> : 'Register Property on Blockchain'}
          </button>
        </form>
      )}
    </div>
  );
}
