import React from 'react';
import { motion } from 'framer-motion';

export default function RideCard({ ride }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      style={{ marginBottom: 12 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{ride.from} → {ride.to}</div>
          <div className="small">{new Date(ride.date).toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700 }}>{ride.seats} seats</div>
          <div className="small">Posted recently</div>
        </div>
      </div>
    </motion.div>
  );
}
