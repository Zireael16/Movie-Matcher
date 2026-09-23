import React from 'react';

/**
 * SeatGrid Component - BookMyShow Design
 * - Tiered sections with horizontal divider lines and price headers
 * - Left row rail
 * - Green outline for available seats, solid gray for booked, golden yellow for selected
 * - Cinema screen positioned at the bottom with perspective 3D styling
 */
const SeatGrid = ({ seats = [], selectedSeatIds = [], onSeatToggle }) => {
  // Group seats by tier: VIP (H-J), GOLD (D-G), SILVER (A-C)
  // In cinema layouts, top tier (VIP) appears at the top, Silver nearest to screen
  const tiersOrder = ['VIP', 'GOLD', 'SILVER'];

  const getTiersData = () => {
    const tieredGroups = {
      VIP: { label: 'VIP', price: null, rows: {} },
      GOLD: { label: 'GOLD', price: null, rows: {} },
      SILVER: { label: 'SILVER', price: null, rows: {} },
    };

    seats.forEach((seat) => {
      const tierKey = seat.tier || 'SILVER';
      if (!tieredGroups[tierKey]) return;

      if (!tieredGroups[tierKey].price && seat.price) {
        tieredGroups[tierKey].price = seat.price;
      }

      if (!tieredGroups[tierKey].rows[seat.rowLabel]) {
        tieredGroups[tierKey].rows[seat.rowLabel] = [];
      }
      tieredGroups[tierKey].rows[seat.rowLabel].push(seat);
    });

    return tieredGroups;
  };

  const tieredData = getTiersData();

  // Helper to format 2-digit seat numbers (e.g. 1 -> "01")
  const formatSeatNum = (num) => (num < 10 ? `0${num}` : `${num}`);

  const getSeatStyle = (seat, isSelected) => {
    const isBooked = seat.status === 'RESERVED' || seat.status === 'LOCKED';

    if (isBooked) {
      return {
        backgroundColor: '#e2e8f0',
        borderColor: '#cbd5e1',
        color: '#94a3b8',
        cursor: 'not-allowed',
      };
    }

    if (isSelected) {
      return {
        backgroundColor: '#eab308', // Golden Yellow
        borderColor: '#ca8a04',
        color: '#ffffff',
        fontWeight: '700',
        boxShadow: '0 2px 6px rgba(234, 179, 8, 0.4)',
      };
    }

    // Available seat: Green outline
    return {
      backgroundColor: '#ffffff',
      borderColor: '#22c55e',
      color: '#16a34a',
      cursor: 'pointer',
    };
  };

  return (
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Tier Sections */}
      {tiersOrder.map((tierKey) => {
        const group = tieredData[tierKey];
        const rowLabels = Object.keys(group.rows).sort().reverse(); // Show top rows descending

        if (rowLabels.length === 0) return null;

        return (
          <div key={tierKey} style={{ width: '100%', marginBottom: '32px' }}>
            {/* Section Header with Line */}
            <div style={{ textAlign: 'center', marginBottom: '14px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: '#e2e8f0',
                zIndex: 0,
              }} />
              <span style={{
                position: 'relative',
                zIndex: 1,
                backgroundColor: '#ffffff',
                padding: '0 16px',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                ₹{group.price ? Number(group.price).toFixed(0) : '—'} {group.label}
              </span>
            </div>

            {/* Rows in this tier */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              {rowLabels.map((rowLabel) => {
                const rowSeats = group.rows[rowLabel].sort((a, b) => a.seatNumber - b.seatNumber);

                return (
                  <div key={rowLabel} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Left Row Indicator */}
                    <span style={{
                      width: '24px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#475569',
                      textAlign: 'center',
                    }}>
                      {rowLabel}
                    </span>

                    {/* Seats Matrix with Aisle separation */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {rowSeats.map((seat, index) => {
                        const isSelected = selectedSeatIds.includes(seat.id);
                        const isAisle = index === 4; // Gap after seat 5

                        return (
                          <React.Fragment key={seat.id}>
                            <button
                              type="button"
                              disabled={seat.status !== 'AVAILABLE'}
                              onClick={() => onSeatToggle(seat)}
                              title={`Seat ${seat.id} • ₹${Number(seat.price).toFixed(0)}`}
                              style={{
                                width: '32px',
                                height: '30px',
                                borderRadius: '4px',
                                border: '1.5px solid',
                                fontSize: '0.72rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease',
                                outline: 'none',
                                ...getSeatStyle(seat, isSelected),
                              }}
                            >
                              {formatSeatNum(seat.seatNumber)}
                            </button>
                            {isAisle && <div style={{ width: '18px' }} />}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Right Row Indicator */}
                    <span style={{
                      width: '24px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#475569',
                      textAlign: 'center',
                    }}>
                      {rowLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Screen Indicator at the Bottom */}
      <div style={{
        marginTop: '24px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '480px',
      }}>
        {/* Curved 3D perspective screen */}
        <div style={{
          width: '100%',
          height: '24px',
          borderBottom: '4px solid #38bdf8',
          borderRadius: '50%',
          boxShadow: '0 12px 14px -6px rgba(56, 189, 248, 0.35)',
        }} />
        <span style={{
          marginTop: '16px',
          fontSize: '0.8rem',
          color: '#64748b',
          letterSpacing: '0.5px',
          fontWeight: '500',
        }}>
          All eyes this way please
        </span>
      </div>

      {/* Status Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '16px',
        borderTop: '1px solid #f1f5f9',
        fontSize: '0.82rem',
        color: '#475569',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', border: '1.5px solid #22c55e', borderRadius: '3px', backgroundColor: '#ffffff' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
          <span>Sold</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#eab308', borderRadius: '3px' }} />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;