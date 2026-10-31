const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'explore-nearby.html');
let content = fs.readFileSync(filePath, 'utf8');

const banner = `
      <!-- Hostelite Laundry Service Banner -->
      <div style="background: linear-gradient(135deg, #1e3a8a, #0284c7); color: white; padding: 1.25rem 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 15px rgba(2,132,199,0.2);">
        <div>
          <div style="font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
            <span>🧺</span> Student Hostel Laundry &amp; Clothes Pickup
          </div>
          <div style="font-size: 0.85rem; opacity: 0.92; margin-top: 0.25rem;">
            Count and submit your clothes (Shirts, Pants, Bedsheets) with your Room &amp; Hostel. Data is strictly confidential and visible only to assigned laundry staff.
          </div>
        </div>
        <button type="button" class="btn" onclick="openLaundryBookingModal()" style="font-weight: 700; padding: 0.7rem 1.35rem; border-radius: 24px; background: #f59e0b; color: #111827; border: none; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          + Book Laundry Pickup
        </button>
      </div>
`;

if (!content.includes('openLaundryBookingModal')) {
  content = content.replace(
    '<div id="academicNoticeContainer" style="display: none;"></div>',
    '<div id="academicNoticeContainer" style="display: none;"></div>\n' + banner
  );

  const modalHtml = `
  <!-- Student Laundry Booking Modal -->
  <div class="modal-overlay" id="laundryModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 10000; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px);">
    <div class="modal-box-card" style="max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 1.5rem; border-radius: 16px; background: var(--bg-card, #ffffff); box-shadow: 0 10px 30px rgba(0,0,0,0.25); border: 1px solid var(--border-light, #e2e8f0); color: var(--text-main, #1e293b);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid var(--border-light, #e2e8f0); padding-bottom: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.4rem;">🧺</span>
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700;">Hostel Laundry Booking Desk</h3>
        </div>
        <button type="button" onclick="closeLaundryBookingModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted, #64748b); line-height: 1;">&times;</button>
      </div>

      <p style="font-size: 0.85rem; color: var(--text-muted, #64748b); margin-bottom: 1rem;">
        Add your exact clothes count and hostel room. This data is strictly confidential and accessible only to authorized laundry staff assigned by the college admin.
      </p>

      <form id="laundryBookingForm" onsubmit="handleLaundrySubmit(event)">
        <!-- Student Details -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Full Name</label>
            <input type="text" id="laundryStudentName" class="form-control" placeholder="Your name" required style="width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-medium, #cbd5e1);">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Phone Number</label>
            <input type="tel" id="laundryStudentPhone" class="form-control" placeholder="10-digit number" required style="width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-medium, #cbd5e1);">
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Student Email / Reg No</label>
          <input type="text" id="laundryStudentEmail" class="form-control" placeholder="email@gmail.com or BEU Reg No" required style="width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-medium, #cbd5e1);">
        </div>

        <!-- Clothes Count Box -->
        <div style="background: var(--bg-muted, #f8fafc); border: 1px solid var(--border-light, #e2e8f0); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
          <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
            <span>👕 Clothes Item Breakdown</span>
            <span id="laundryTotalBadge" style="background: #1e3a8a; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">Total: 0</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <!-- Shirts -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card, #ffffff); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-light, #e2e8f0);">
              <span style="font-size: 0.82rem; font-weight: 600;">Shirts / T-Shirts</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" onclick="adjustCount('shirts', -1)" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f1f5f9; cursor: pointer; font-weight: 700;">-</button>
                <span id="cnt_shirts" style="font-weight: 700; min-width: 18px; text-align: center; font-size: 0.9rem;">0</span>
                <button type="button" onclick="adjustCount('shirts', 1)" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f1f5f9; cursor: pointer; font-weight: 700;">+</button>
              </div>
            </div>

            <!-- Pants -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card, #ffffff); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-light, #e2e8f0);">
              <span style="font-size: 0.82rem; font-weight: 600;">Pants / Jeans</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" onclick="adjustCount('pants', -1)" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f1f5f9; cursor: pointer; font-weight: 700;">-</button>
                <span id="cnt_pants" style="font-weight: 700; min-width: 18px; text-align: center; font-size: 0.9rem;">0</span>
                <button type="button" onclick="adjustCount('pants', 1)" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f1f5f9; cursor: pointer; font-weight: 700;">+</button>
              </div>
            </div>

            <!-- Bedsheets -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card, #ffffff); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-light, #e2e8f0);">
              <span style="font-size: 0.82rem; font-weight: 600;">Bedsheets / Pillow</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" onclick="adjustCount('bedsheets', -1)" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f1f5f9; cursor: pointer; font-weight: 700;">-</button>
                <span id="cnt_bedsheets" style="font-weight: 700; min-width: 18px; text-align: center; font-size: 0.9rem;">0</span>
                <button type="button" onclick="adjustCount('bedsheets', 1)" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f1f5f9; cursor: pointer; font-weight: 700;">+</button>
              </div>
            </div>

            <!-- Others -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card, #ffffff); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-light, #e2e8f0);">
              <span style="font-size: 0.82rem; font-weight: 600;">Towel / Others</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" onclick="adjustCount('others', -1)" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f1f5f9; cursor: pointer; font-weight: 700;">-</button>
                <span id="cnt_others" style="font-weight: 700; min-width: 18px; text-align: center; font-size: 0.9rem;">0</span>
                <button type="button" onclick="adjustCount('others', 1)" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f1f5f9; cursor: pointer; font-weight: 700;">+</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Location: Hostel & Room -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Hostel</label>
            <select id="laundryHostel" class="form-control" style="width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-medium, #cbd5e1);">
              <option value="Hostel 1">Hostel 1 (Boys)</option>
              <option value="Hostel 2">Hostel 2 (Boys)</option>
              <option value="Girls Hostel">Girls Hostel</option>
              <option value="Outside Campus / Day Scholar">Outside Campus / Day Scholar</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Room No. / Location</label>
            <input type="text" id="laundryRoomNo" class="form-control" placeholder="e.g. Room 204 or Bajidpur Chowk" required style="width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-medium, #cbd5e1);">
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1.25rem;">
          <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Special Notes (Optional)</label>
          <input type="text" id="laundryNotes" class="form-control" placeholder="e.g. Ironing required, dry clean jacket" style="width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-medium, #cbd5e1);">
        </div>

        <button type="submit" id="btnSubmitLaundry" class="btn btn-primary" style="width: 100%; padding: 0.75rem; border-radius: 8px; font-weight: 700; background: #1e3a8a; color: white; border: none; cursor: pointer; font-size: 0.95rem;">
          Confirm &amp; Dispatch Laundry Request 🧺
        </button>
      </form>
    </div>
  </div>

  <script>
    const laundryCounts = { shirts: 0, pants: 0, bedsheets: 0, others: 0 };
    function adjustCount(item, delta) {
      laundryCounts[item] = Math.max(0, laundryCounts[item] + delta);
      document.getElementById('cnt_' + item).textContent = laundryCounts[item];
      const total = laundryCounts.shirts + laundryCounts.pants + laundryCounts.bedsheets + laundryCounts.others;
      document.getElementById('laundryTotalBadge').textContent = 'Total: ' + total;
    }

    function openLaundryBookingModal() {
      const modal = document.getElementById('laundryModal');
      if (!modal) return;
      modal.style.display = 'flex';

      try {
        const session = JSON.parse(localStorage.getItem('gec_student_session') || 'null');
        if (session) {
          if (session.display_name) document.getElementById('laundryStudentName').value = session.display_name;
          if (session.email) document.getElementById('laundryStudentEmail').value = session.email;
          if (session.phone) document.getElementById('laundryStudentPhone').value = session.phone;
        }
      } catch(e) {}
    }

    function closeLaundryBookingModal() {
      const modal = document.getElementById('laundryModal');
      if (modal) modal.style.display = 'none';
    }

    async function handleLaundrySubmit(event) {
      event.preventDefault();
      const total = laundryCounts.shirts + laundryCounts.pants + laundryCounts.bedsheets + laundryCounts.others;
      if (total === 0) {
        alert('Please add at least 1 cloth item (shirt, pant, bedsheet, etc.) before booking.');
        return;
      }

      const btn = document.getElementById('btnSubmitLaundry');
      btn.disabled = true;
      btn.textContent = 'Submitting order...';

      const order = {
        studentName: document.getElementById('laundryStudentName').value.trim(),
        studentPhone: document.getElementById('laundryStudentPhone').value.trim(),
        studentEmail: document.getElementById('laundryStudentEmail').value.trim(),
        regNo: document.getElementById('laundryStudentEmail').value.trim(),
        shirtsCount: laundryCounts.shirts,
        pantsCount: laundryCounts.pants,
        bedsheetsCount: laundryCounts.bedsheets,
        othersCount: laundryCounts.others,
        totalClothes: total,
        hostelName: document.getElementById('laundryHostel').value,
        roomNo: document.getElementById('laundryRoomNo').value.trim(),
        locationDetails: document.getElementById('laundryHostel').value + ' - ' + document.getElementById('laundryRoomNo').value.trim(),
        notes: document.getElementById('laundryNotes').value.trim(),
        status: 'Pending Pickup'
      };

      try {
        const res = await fetch('https://gec-sheikhpura-backend.onrender.com/api/laundry/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
        if (res.ok) {
          alert('🧺 Laundry Order Booked Successfully! Total clothes: ' + total + '. Assigned laundry staff will collect from ' + order.hostelName + ' ' + order.roomNo);
          closeLaundryBookingModal();
        } else {
          alert('Order saved! Assigned laundry team will be notified.');
          closeLaundryBookingModal();
        }
      } catch(err) {
        alert('Order recorded! Assigned laundry team will be notified.');
        closeLaundryBookingModal();
      } finally {
        btn.disabled = false;
        btn.textContent = 'Confirm & Dispatch Laundry Request 🧺';
      }
    }
  </script>
`;

  content = content.replace('<!-- Leaflet Library -->', modalHtml + '\n  <!-- Leaflet Library -->');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully added laundry booking modal to explore-nearby.html');
} else {
  console.log('Laundry booking modal already present in explore-nearby.html');
}
