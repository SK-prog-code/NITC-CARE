const testSmoke = async () => {
  const BASE_URL = 'http://localhost:5000/api/v1';

  console.log('🧪 Starting End-to-End API Automated Verification...');

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('✅ Health check:', health.data.status, health.message);

    // 2. Student Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'keerthan_b241139ch@nitc.ac.in',
        password: 'Student@123',
      }),
    });
    const loginData = await loginRes.json();
    console.log('✅ Student Login:', loginData.data.user.name, `(Token issued: ${Boolean(loginData.data.token)})`);
    const studentToken = loginData.data.token;

    // 3. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'chiefwarden@nitc.ac.in',
        password: 'Admin@123',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    console.log('✅ Admin Login:', adminLoginData.data.user.name, `(Role: ${adminLoginData.data.user.role})`);
    const adminToken = adminLoginData.data.token;

    // 4. Fetch Categories
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    console.log(`✅ Categories retrieved: ${catData.data.length} categories active`);
    const testCategory = catData.data[0];

    // 5. Submit New Complaint as Student
    const submitRes = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Projector Lamp Flickering in LH-201',
        description: 'The projector lamp keeps turning off every 5 minutes during operating systems lecture.',
        categoryId: testCategory._id,
        location: 'Academic Block B, Room 201',
        priority: 'high',
      }),
    });
    const submitData = await submitRes.json();
    const newComplaint = submitData.data;
    console.log('✅ Complaint Created:', newComplaint.complaintCode, `(Status: ${newComplaint.status})`);

    // 6. Fetch Student's Complaints
    const myCompRes = await fetch(`${BASE_URL}/complaints`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const myCompData = await myCompRes.json();
    console.log(`✅ Student Complaints list: ${myCompData.data.length} tickets found for this student`);

    // 7. Admin assigns complaint to Department
    const deptsRes = await fetch(`${BASE_URL}/departments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deptsData = await deptsRes.json();
    const testDept = deptsData.data[0];

    const assignRes = await fetch(`${BASE_URL}/complaints/${newComplaint._id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        departmentId: testDept._id,
        note: 'Assigned to department for replacement inspection',
      }),
    });
    const assignData = await assignRes.json();
    console.log('✅ Admin Assigned Complaint:', assignData.data.complaintCode, `➔ Status: ${assignData.data.status}`);

    // 8. Advance status to in_progress
    const inProgressRes = await fetch(`${BASE_URL}/complaints/${newComplaint._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'in_progress',
        note: 'Technician dispatched to replace lamp bulb',
      }),
    });
    const inProgressData = await inProgressRes.json();
    console.log('✅ Advanced to In Progress:', inProgressData.data.status);

    // 9. Mark resolved with resolution notes
    const resolveRes = await fetch(`${BASE_URL}/complaints/${newComplaint._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'resolved',
        resolutionNotes: 'Replaced projector lamp bulb with new OEM unit and tested for 30 minutes.',
      }),
    });
    const resolveData = await resolveRes.json();
    console.log('✅ Marked Resolved:', resolveData.data.status, `(Notes: "${resolveData.data.resolutionNotes}")`);

    // 10. Close complaint
    const closeRes = await fetch(`${BASE_URL}/complaints/${newComplaint._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'closed',
        note: 'Verified with professor and closed',
      }),
    });
    const closeData = await closeRes.json();
    console.log('✅ Closed Complaint:', closeData.data.status, `(ClosedAt: ${Boolean(closeData.data.closedAt)})`);

    // 11. Fetch Summary Stats
    const statsRes = await fetch(`${BASE_URL}/stats/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsData = await statsRes.json();
    console.log('✅ Admin Summary Stats:', {
      total: statsData.data.total,
      resolved: statsData.data.resolved,
      closed: statsData.data.closed,
      resolutionRate: `${statsData.data.resolutionRate}%`,
      avgResolutionHours: `${statsData.data.avgResolutionHours} hrs`,
    });

    // 12. Student views updated timeline
    const finalDetailRes = await fetch(`${BASE_URL}/complaints/${newComplaint._id}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const finalDetail = await finalDetailRes.json();
    console.log(`✅ Activity Timeline Audit Trail: ${finalDetail.data.activityLog.length} events logged in order:`);
    finalDetail.data.activityLog.forEach((log, idx) => {
      console.log(`   ${idx + 1}. [${log.action}] by ${log.actorName} (${log.actorRole}): ${log.note}`);
    });

    console.log('\n🎉 ALL 12 AUTOMATED END-TO-END SYSTEM TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
};

testSmoke();
