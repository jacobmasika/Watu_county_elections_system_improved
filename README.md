# 🗳️ Watu County Election System

A complete, secure digital voting system for Watu County elections with real-time results tracking.

## System Features

### Frontend
- ✅ Voter Registration with validation
- ✅ Voter Verification before voting
- ✅ Secure Vote Submission
- ✅ Live Election Results with real-time updates
- ✅ Admin Dashboard with statistics and audit logs
- ✅ Search and filter capabilities
- ✅ Responsive design for all devices
- ✅ Print-friendly reports

### Backend
- ✅ SQLite Database for secure data storage
- ✅ Voter Management with duplicate prevention
- ✅ Vote recording with timestamps
- ✅ Real-time results ranking
- ✅ Admin statistics and analytics
- ✅ Complete audit logging
- ✅ Constituency and ward management

## Installation & Setup

### 1. Prerequisites
- Python 3.7+
- Flask and dependencies (see requirements below)
- Modern web browser

### 2. Install Python Dependencies
```bash
cd c:\Users\User\Desktop\Watusystem2
pip install flask flask-sqlalchemy
```

### 3. Run the Application

#### Start Backend Server:
```bash
python app1.py
```

The backend will:
- Initialize the database
- Load sample candidates
- Run on http://localhost:5000

#### Access Frontend:
- **Public Voting Portal**: http://localhost:5000/
- **Admin Dashboard**: http://localhost:5000/admin
- **Admin Login**: http://localhost:5000/login

### 4. Default Admin Credentials
- **Password**: `KrIstii02$$`

## System Architecture

```
Project Structure:
├── app1.py                 # Flask backend & database models
├── static1/
│   ├── script1.js         # Frontend logic & API integration
│   └── style1.css         # Global styles
├── templates1/
│   ├── index1.html        # Public voting portal
│   ├── admin1.html        # Admin dashboard
│   └── login1.html        # Admin login
└── instance/
    └── watu_election.db   # SQLite database (auto-created)
```

## API Endpoints

### Public Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Home page |
| `/register` | POST | Register voter |
| `/verify_voter/<id>` | GET | Verify voter status |
| `/submit_vote` | POST | Cast vote |
| `/results?position=X` | GET | Get ranked results |
| `/results_summary` | GET | Election summary |
| `/login` | GET/POST | Admin login |

### Admin Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin` | GET | Admin dashboard |
| `/admin/candidates` | GET/POST | Manage candidates |
| `/admin/stats` | GET | Admin statistics |
| `/admin/audit_log` | GET | Voting audit trail |
| `/logout` | GET | Logout |

## Database Models

### Voter
- voter_id (unique)
- name
- email
- constituency
- ward
- has_voted (boolean)
- registration_date

### Candidate
- name
- position (Governor, Senator, MP, MCA)
- party
- constituency
- ward
- registration_date

### Vote
- voter_id
- candidate_id (foreign key)
- constituency
- ward
- timestamp
- Unique constraint: voter_id per constituency

### Ward
- name
- constituency
- registered_voters count

## Features Walkthrough

### 1. Voter Registration
1. Click "Register" tab
2. Enter voter ID, name, email
3. Select constituency → ward auto-populates
4. Submit registration
5. Receive confirmation

### 2. Verify Voter
1. Click "Verify Voter" tab
2. Enter voter ID
3. System confirms registration & voting eligibility
4. Shows voter details if registered

### 3. Cast Vote
1. Click "Cast Vote" tab
2. Enter voter ID
3. Select candidate from dropdown
4. Submit vote
5. Vote recorded with timestamp

### 4. Live Results
1. Click "Live Results" tab
2. View real-time election summary
3. See ranked candidates
4. Search/filter by candidate name
5. Last update timestamp shown

### 5. Admin Dashboard
1. Login with password: `KrIstii02$$`
2. **Overview Tab**: View statistics
   - Total candidates
   - Registered voters
   - Votes cast
3. **Results Tab**: Real-time results table
4. **Candidates Tab**: Add candidates or view registered ones
5. **Audit Log Tab**: Complete voting history
6. Print official reports

## Testing the System

### Sample Test Flow
1. **Register a voter**
   - ID: 123456
   - Name: John Doe
   - Email: john@test.com
   - Constituency: Wapendwa
   - Ward: Ward A1

2. **Verify the voter**
   - ID: 123456
   - Should show "Ready to vote"

3. **Cast a vote**
   - ID: 123456
   - Select John Muthoni (Governor, UDA)

4. **Check results**
   - John Muthoni should have 1 vote
   - Voter status changes to "Already Voted"

5. **Try duplicate vote**
   - Should be rejected with error message

## Troubleshooting

### Backend Not Starting
```bash
# Check if port 5000 is available
# Kill any process on port 5000
# Ensure Python and pip are installed
python --version
pip list | grep flask
```

### Database Issues
```bash
# Delete old database to reset
rm instance/watu_election.db
# Run app again to create new database
python app1.py
```

### API Connection Failed
- Ensure backend is running on http://localhost:5000
- Check browser console for errors (F12)
- Verify no firewall blocking localhost:5000

### Tab Not Switching
- Check browser console (F12)
- Ensure JavaScript is enabled
- Clear browser cache (Ctrl+Shift+Delete)

## Security Features

✅ **Duplicate Prevention**: Same voter ID cannot vote twice
✅ **Unique Constraints**: Database-level validation
✅ **Admin Authentication**: Password-protected dashboard
✅ **Audit Logging**: Complete voting records
✅ **Data Validation**: Server-side input validation
✅ **Session Management**: Secure admin sessions
✅ **Error Handling**: Graceful error messages

## Performance Features

⚡ **Real-time Updates**: Results update instantly
⚡ **Efficient Queries**: Database indexing on voter_id
⚡ **Caching**: Frontend caching of candidates
⚡ **Responsive Design**: Fast on mobile devices
⚡ **Minimal Payload**: Optimized API responses

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## Support & Maintenance

### Regular Maintenance
```bash
# Backup database
copy instance\watu_election.db instance\watu_election_backup.db

# Check voting statistics
# Run admin dashboard and view summary stats

# Generate reports
# Use Print functionality in admin dashboard
```

### Common Tasks
- **Add Candidate**: Admin → Manage Candidates → Add New
- **View Results**: Public → Live Results or Admin → Results
- **Check Audit Log**: Admin → Audit Log
- **Reset System**: Delete database and restart app

## License
Confidential - Watu County Election Commission

## Contact
For support, contact the Election System Administrator.

---

**Last Updated**: January 18, 2026
**Version**: 1.0 - Production Ready
