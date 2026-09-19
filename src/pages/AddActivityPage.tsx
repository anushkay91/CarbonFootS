import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import AddActivityForm from '../components/AddActivityForm';

export default function AddActivityPage() {
  return (
    <Layout>
      <AddActivityForm />
    </Layout>
  );
}
