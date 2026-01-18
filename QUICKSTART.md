# 🚀 QUICK START GUIDE

## 30-Second Setup

### Step 1: Install Dependencies (1 minute)
```bash
cd c:\Users\User\Desktop\Watusystem2
pip install -r requirements.txt
```

### Step 2: Start Backend (5 seconds)
```bash
python app1.py
```

You should see:
```
🗳️ Watu County Election System Backend is running...
 * Running on http://127.0.0.1:5000
```

### Step 3: Open in Browser
- **Voting Portal**: http://localhost:5000/
- **Admin Panel**: http://localhost:5000/admin
- **Admin Password**: `KrIstii02$$`

## Common Tasks

### Register & Vote
1. Go to http://localhost:5000/
2. Click "Register" tab
3. Enter: ID, Name, Email, Constituency (Wapendwa), Ward (Ward A1)
4. Click "Register"
5. Click "Cast Vote" tab
6. Enter voter ID
7. Select candidate
8. Click "Submit Vote"

### Add Candidates (Admin)
1. Go to http://localhost:5000/login
2. Enter password: `KrIstii02$$`
3. Click "Manage Candidates"
4. Fill form and click "Add Candidate"

### View Results
1. Public: http://localhost:5000/ → "Live Results" tab
2. Admin: http://localhost:5000/admin → "Results" tab

## Troubleshooting

### "Cannot connect to backend"
1. Check if app is running (see Step 2)
2. Port 5000 might be in use
3. Try: `netstat -ano | findstr :5000` (Windows)

### "Database errors"
1. Delete `instance/watu_election.db`
2. Restart app - database will be recreated

### "Tabs not working"
1. Press F12 to open browser console
2. Check for JavaScript errors
3. Clear browser cache (Ctrl+Shift+Del)

## Test Data

### Sample Voters
- ID: 111111, Name: John Doe
- ID: 222222, Name: Sarah Smith
- ID: 333333, Name: Peter Kipchoge

### Constituencies
- Wapendwa → Ward A1, A2, A3
- Wasiopenda → Ward B1, B2, B3
- Umoja → Ward C1, C2, C3
- Amani → Ward D1, D2, D3
- Nuru → Ward E1, E2, E3

### Sample Candidates (Auto-loaded)
- John Muthoni (Governor, UDA, Watu)
- Sarah Kimani (Governor, ODM, Watu)
- Peter Kipchoge (Senator, UDA, Watu)
- Grace Omondi (Senator, ODM, Watu)

## Features Quick Reference

| Feature | Path | Notes |
|---------|------|-------|
| Register Voter | `/` → Register | Auto-loads sample data |
| Verify Voter | `/` → Verify | Check before voting |
| Cast Vote | `/` → Cast Vote | One vote per voter |
| See Results | `/` → Results | Real-time updates |
| Admin Dashboard | `/admin` | Requires login |
| Candidates | `/admin` → Candidates | Add/manage here |
| Audit Log | `/admin` → Audit | Voting history |
| Logout | `/` or `/admin` | Logout button present |

## Keyboard Shortcuts

- `F12` - Open Developer Console (debug)
- `Ctrl+Shift+Del` - Clear browser cache
- `Ctrl+R` - Refresh page
- `Tab` - Navigate form fields

## API Testing (Advanced)

### Get Results
```
GET http://localhost:5000/results?position=Governor
```

### Submit Vote
```
POST http://localhost:5000/submit_vote
Body: {"voter_id": "123", "candidate_id": 1}
```

### Get Admin Stats
```
GET http://localhost:5000/admin/stats
```

## Success Indicators

✅ Backend running with "🗳️ Watu County Election System"
✅ Voting portal loads without errors
✅ Candidates dropdown populates
✅ Registration and voting succeed
✅ Results update in real-time
✅ Admin login works with password
✅ Candidate management works

## Emergency Reset

To reset everything:
```bash
# Stop app (Ctrl+C)
# Delete database
del instance\watu_election.db

# Delete Python cache
rmdir /s /q __pycache__

# Restart
python app1.py
```

## Contact Support

For issues, check:
1. Browser console (F12)
2. Backend console output
3. FIXES_SUMMARY.md for known issues
4. README.md for detailed docs

---

**You're all set! 🎉**

The election system is ready to use.
Start with Step 1-3 above and you're good to go!
