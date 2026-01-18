// ===== WATU COUNTY ELECTION SYSTEM - FRONTEND INTEGRATION =====

// Dynamically determine the API base URL from the current device's IP
const API_BASE = `http://${window.location.hostname}:5000`;

const countyData = {
    "Wapendwa": ["Ward A1", "Ward A2", "Ward A3"],
    "Wasiopenda": ["Ward B1", "Ward B2", "Ward B3"],
    "Umoja": ["Ward C1", "Ward C2", "Ward C3"],
    "Amani": ["Ward D1", "Ward D2", "Ward D3"],
    "Nuru": ["Ward E1", "Ward E2", "Ward E3"]
};

// ===== 1. VOTER REGISTRATION =====
async function registerVoter() {
    const voterId = document.getElementById("regVoterId")?.value;
    const name = document.getElementById("regVoterName")?.value;
    const email = document.getElementById("regVoterEmail")?.value;
    const phone = document.getElementById("regVoterPhone")?.value;
    const constituency = document.getElementById("regConstituency")?.value;
    const ward = document.getElementById("regWard")?.value;

    if (!voterId || !name || !email || !constituency) {
        showMessage("Please fill in all required fields!", "error");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                voter_id: voterId,
                name: name,
                email: email,
                phone: phone,
                constituency: constituency,
                ward: ward || 'General'
            })
        });

        const data = await response.json();
        
        if (data.status === "success") {
            showMessage("✅ " + data.message, "success");
            document.getElementById("regVoterId").value = '';
            document.getElementById("regVoterName").value = '';
            document.getElementById("regVoterEmail").value = '';
            document.getElementById("regVoterPhone").value = '';
            document.getElementById("regConstituency").value = '';
            document.getElementById("regWard").value = '';
        } else {
            showMessage("❌ " + data.message, "error");
        }
    } catch (error) {
        showMessage("Registration failed: " + error.message, "error");
        console.error("Error:", error);
    }
}

// ===== 2. VERIFY VOTER =====
async function verifyVoter() {
    const voterId = document.getElementById("verifyVoterId")?.value;

    if (!voterId) {
        showMessage("Please enter your Voter ID", "warning");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/verify_voter/${voterId}`);
        const data = await response.json();

        if (data.status === "found") {
            if (data.has_voted) {
                showMessage("⚠️ You have already voted!", "warning");
                document.getElementById("voterStatus").innerHTML = `
                    <div style="color: orange; font-weight: bold; padding: 15px; background: #fff3cd; border-radius: 5px;">
                        <p>Voter Status: Already Voted</p>
                        <hr>
                        <p><strong>Voter ID:</strong> ${data.voter_id}</p>
                        <p><strong>Name:</strong> ${data.name}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                        <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
                        <p><strong>Constituency:</strong> ${data.constituency}</p>
                        <p><strong>Ward:</strong> ${data.ward}</p>
                    </div>
                `;
            } else {
                showMessage("✅ Voter verified! Ready to vote.", "success");
                document.getElementById("voterStatus").innerHTML = `
                    <div style="color: green; font-weight: bold; padding: 15px; background: #d4edda; border-radius: 5px;">
                        <h3 style="margin-top: 0; color: #155724;">✓ Voter Verified</h3>
                        <p><strong>Voter ID:</strong> ${data.voter_id}</p>
                        <p><strong>Full Name:</strong> ${data.name}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                        <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
                        <p><strong>Constituency:</strong> ${data.constituency}</p>
                        <p><strong>Ward:</strong> ${data.ward}</p>
                        <p><strong>Status:</strong> Ready to Vote</p>
                    </div>
                `;
            }
        } else {
            showMessage("❌ Voter ID not found. Please register first.", "error");
        }
    } catch (error) {
        showMessage("Verification failed: " + error.message, "error");
        console.error("Error:", error);
    }
}

// ===== 3. UPDATE WARDS BASED ON CONSTITUENCY =====
function updateWards(prefix = '') {
    const prefix_str = prefix ? prefix : 'reg';
    const constituency = document.getElementById(prefix_str + "Constituency")?.value;
    const wardSelect = document.getElementById(prefix_str + "Ward");

    if (!wardSelect) return;
    wardSelect.innerHTML = '<option value="">-- Select Ward --</option>';

    if (constituency && countyData[constituency]) {
        countyData[constituency].forEach(ward => {
            const opt = document.createElement("option");
            opt.value = ward;
            opt.text = ward;
            wardSelect.add(opt);
        });
    }
}

// ===== 4. LOAD CANDIDATES & DISPLAY IN DROPDOWN =====
async function loadCandidates() {
    try {
        const response = await fetch(`${API_BASE}/candidates`);
        if (!response.ok) throw new Error("Failed to load candidates");
        
        const data = await response.json();
        window.allCandidates = data.candidates || [];
    } catch (error) {
        console.error("Error loading candidates:", error);
        showMessage("Could not load candidates. Make sure backend is running.", "warning");
    }
}

// Load candidates filtered by position
async function loadCandidatesByPosition() {
    const position = document.getElementById("votePosition")?.value;
    const candidateSelect = document.getElementById("voteCandidateId");
    
    if (!position) {
        candidateSelect.innerHTML = '<option value="">-- Select a position first --</option>';
        return;
    }
    
    const filteredCandidates = window.allCandidates.filter(c => c.position === position);
    
    candidateSelect.innerHTML = '<option value="">-- Select Your Candidate --</option>';
    filteredCandidates.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.text = `${c.name} (${c.party || 'N/A'})`;
        candidateSelect.add(opt);
    });
}

// ===== 5. FETCH & DISPLAY ELECTION RESULTS =====
async function fetchRankedResults(position = 'Governor', constituency = null) {
    try {
        let url = `${API_BASE}/results?position=${position}`;
        if (constituency) url += `&constituency=${constituency}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch results");
        
        const data = await response.json();

        // Update results table
        const tableBody = document.getElementById('resultsTableBody');
        if (tableBody && data.results) {
            tableBody.innerHTML = '';
            data.results.forEach((result, index) => {
                const rank = index + 1;
                const highlight = rank === 1 ? 'class="rank-1"' : '';

                const tr = `<tr ${highlight}>
                    <td style="text-align: center;"><strong>${rank}</strong></td>
                    <td>${result.name}</td>
                    <td>${result.position}</td>
                    <td>${result.party || 'Independent'}</td>
                    <td style="text-align: center;"><strong>${result.votes}</strong></td>
                </tr>`;
                tableBody.innerHTML += tr;
            });
        }

        // Update timestamp
        const dateEl = document.getElementById('reportDate');
        if (dateEl) dateEl.innerText = new Date().toLocaleString();

    } catch (error) {
        console.error("Error fetching results:", error);
    }
}

// Update results display when position filter changes
function updateResultsDisplay() {
    const position = document.getElementById('resultsPosition')?.value || 'Governor';
    document.getElementById('resultsTitle').textContent = position + ' Results';
    fetchRankedResults(position);
}

// ===== 6. FETCH ELECTION SUMMARY =====
async function fetchElectionSummary() {
    try {
        const response = await fetch(`${API_BASE}/results_summary`);
        if (!response.ok) throw new Error("Failed to fetch summary");
        
        const data = await response.json();

        const summaryDiv = document.getElementById("electionSummary");
        if (summaryDiv) {
            let html = `
                <h3>📊 Election Summary</h3>
                <p><strong>Registered Voters:</strong> ${data.total_registered_voters}</p>
                <p><strong>Votes Cast:</strong> ${data.votes_cast}</p>
                <p><strong>Voter Turnout:</strong> ${data.voter_turnout}</p>
                <hr>
                <h4>Leading Candidates by Position:</h4>
            `;

            for (const [position, leader] of Object.entries(data.leading_candidates)) {
                html += `
                    <p><strong>${position}:</strong> ${leader.leading} (${leader.party}) - ${leader.votes} votes</p>
                `;
            }

            summaryDiv.innerHTML = html;
        }
    } catch (error) {
        console.error("Error fetching summary:", error);
    }
}

// ===== 6B. VERIFY VOTER FOR VOTING (WITH CONFIRMATION) =====
async function verifyVoterForVoting() {
    const voterId = document.getElementById("voteVoterId")?.value;
    const confirmationDiv = document.getElementById("voterConfirmation");

    if (!voterId) {
        confirmationDiv.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/verify_voter/${voterId}`);
        const data = await response.json();

        if (data.status === "found") {
            if (data.has_voted) {
                confirmationDiv.innerHTML = `
                    <div style="color: #856404; background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0;"><strong>⚠️ Voting Status: Already Voted</strong></p>
                        <p style="margin: 5px 0;"><strong>Voter ID:</strong> ${data.voter_id}</p>
                        <p style="margin: 5px 0;"><strong>Name:</strong> ${data.name}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
                        <p style="margin: 5px 0;"><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Constituency:</strong> ${data.constituency}</p>
                        <p style="margin: 5px 0;"><strong>Ward:</strong> ${data.ward}</p>
                    </div>
                `;
            } else {
                confirmationDiv.innerHTML = `
                    <div style="background: #d4edda; border: 2px solid #28a745; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #155724;">✓ Voter Verified - Please Confirm Your Information</p>
                        <p style="margin: 5px 0;"><strong>Voter ID:</strong> ${data.voter_id}</p>
                        <p style="margin: 5px 0;"><strong>Full Name:</strong> ${data.name}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
                        <p style="margin: 5px 0;"><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Constituency:</strong> ${data.constituency}</p>
                        <p style="margin: 5px 0;"><strong>Ward:</strong> ${data.ward}</p>
                        <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #155724;"><em>Proceed only if this information is correct.</em></p>
                    </div>
                `;
            }
        } else {
            confirmationDiv.innerHTML = `
                <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                    <strong>❌ Voter ID not found</strong><br>
                    Please register first or check your Voter ID.
                </div>
            `;
        }
    } catch (error) {
        confirmationDiv.innerHTML = `
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <strong>❌ Verification failed:</strong> ${error.message}
            </div>
        `;
        console.error("Error:", error);
    }
}

// ===== 7. SUBMIT VOTE =====
async function submitVote() {
    const voterId = document.getElementById("voteVoterId")?.value;
    const candidateId = document.getElementById("voteCandidateId")?.value;
    const position = document.getElementById("votePosition")?.value;

    if (!voterId || !candidateId || !position) {
        showMessage("Please fill in all required fields!", "error");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/submit_vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                voter_id: voterId,
                candidate_id: parseInt(candidateId),
                position: position
            })
        });

        const data = await response.json();

        if (data.status === "success") {
            showMessage("✅ " + data.message, "success");
            document.getElementById("voteCandidateId").value = '';
            document.getElementById("votePosition").value = '';
            document.getElementById("voteCandidateId").innerHTML = '<option value="">-- Select a position first --</option>';
            
            // Show status message
            document.getElementById("voteStatus").innerHTML = `
                <div style="background: #d4edda; border: 1px solid #28a745; color: #155724; padding: 15px; border-radius: 5px;">
                    <strong>✓ Vote for ${position} recorded!</strong><br>
                    You can now vote for another position or close this tab.
                </div>
            `;
            
            setTimeout(() => {
                fetchRankedResults('Governor');
                fetchElectionSummary();
            }, 1000);
        } else {
            showMessage("❌ " + data.message, "error");
        }
    } catch (error) {
        showMessage("Voting failed: " + error.message, "error");
        console.error("Error:", error);
    }
}

// ===== 8. LOAD ADMIN STATISTICS =====
async function loadAdminStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`);
        if (!response.ok) throw new Error("Failed to load stats");
        
        const data = await response.json();

        const statsDiv = document.getElementById("adminStats");
        if (statsDiv) {
            let html = `
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-label">Total Candidates</div>
                        <div class="stat-value">${data.total_candidates}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Registered Voters</div>
                        <div class="stat-value">${data.total_registered_voters}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Votes Cast</div>
                        <div class="stat-value">${data.total_votes_cast}</div>
                    </div>
                </div>
            `;
            
            statsDiv.innerHTML = html;
        }
    } catch (error) {
        console.error("Error loading admin stats:", error);
    }
}

// ===== 9. LOAD AUDIT LOG =====
async function loadAuditLog() {
    try {
        const response = await fetch(`${API_BASE}/admin/audit_log`);
        if (!response.ok) throw new Error("Failed to load audit log");
        
        const data = await response.json();

        const auditDiv = document.getElementById("auditLog");
        if (auditDiv) {
            let html = '<h3>🔐 Voting Audit Log (Last 100)</h3><table><thead><tr><th>Voter ID</th><th>Candidate ID</th><th>Time</th><th>Constituency</th></tr></thead><tbody>';
            
            data.audit_log.forEach(log => {
                const time = new Date(log.timestamp).toLocaleString();
                html += `<tr><td>${log.voter_id}</td><td>${log.candidate_id}</td><td>${time}</td><td>${log.constituency}</td></tr>`;
            });
            
            html += '</tbody></table>';
            auditDiv.innerHTML = html;
        }
    } catch (error) {
        console.error("Error loading audit log:", error);
    }
}

// ===== 10. SEARCH & FILTER TABLE =====
function filterTable() {
    const input = document.getElementById("searchInput")?.value.toLowerCase() || '';
    const rows = document.querySelectorAll("#resultsTableBody tr");

    rows.forEach(row => {
        const match = row.textContent.toLowerCase().includes(input);
        row.style.display = match ? "" : "none";
    });
}

// ===== 11. SHOW MESSAGE NOTIFICATIONS =====
function showMessage(message, type = "info") {
    const messageDiv = document.createElement("div");
    const bgColors = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'warning': '#f39c12',
        'info': '#3498db'
    };
    
    messageDiv.style.cssText = `
        position: fixed; 
        top: 20px; 
        right: 20px; 
        padding: 15px 20px; 
        border-radius: 5px;
        background: ${bgColors[type] || bgColors['info']};
        color: white; 
        font-weight: bold; 
        z-index: 9999; 
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => messageDiv.remove(), 4000);
}

// ===== LOAD CANDIDATES TABLE FOR ADMIN =====
async function loadCandidatesTable() {
    try {
        const response = await fetch(`${API_BASE}/admin/candidates`);
        if (!response.ok) throw new Error("Failed to load candidates");
        
        const data = await response.json();
        
        const tableBody = document.getElementById("candidatesTableBody");
        if (tableBody && data.candidates) {
            tableBody.innerHTML = '';
            data.candidates.forEach(c => {
                const tr = `<tr>
                    <td>${c.name}</td>
                    <td>${c.position}</td>
                    <td>${c.party || 'N/A'}</td>
                    <td>${c.constituency || 'N/A'}</td>
                    <td class="no-print" style="text-align: center;">
                        <button onclick="deleteCandidate(${c.id}, '${c.name}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Delete</button>
                    </td>
                </tr>`;
                tableBody.innerHTML += tr;
            });
        }
    } catch (error) {
        console.error("Error loading candidates table:", error);
    }
}

// ===== SWITCH ADMIN TABS =====
function switchAdminTab(e, tabName) {
    if (e) e.preventDefault();
    
    const contents = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    contents.forEach(c => c.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));
    
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    if (e && e.target) {
        e.target.classList.add('active');
    }
}

// Update admin results display when position filter changes
function updateAdminResultsDisplay() {
    const position = document.getElementById('adminResultsPosition')?.value || 'Governor';
    document.getElementById('adminResultsTitle').textContent = position + ' Results';
    fetchRankedResults(position);
}

// ===== 12. INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("🗳️ Election System Initialized");
    loadCandidates();
    fetchRankedResults('Governor');
    fetchElectionSummary();
    
    // Optional: Load admin features if on admin page
    if (document.getElementById("adminStats")) {
        loadAdminStats();
        loadAuditLog();
    }
    
    // Load candidates table on admin if exists
    if (document.getElementById("candidatesTableBody")) {
        loadCandidatesTable();
    }
    
    // Auto-refresh election summary and results every 3 seconds
    setInterval(function() {
        fetchElectionSummary();
        const position = document.getElementById('resultsPosition')?.value || 'Governor';
        fetchRankedResults(position);
    }, 3000);
});