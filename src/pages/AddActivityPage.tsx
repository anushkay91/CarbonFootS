import React from 'react';
import Layout from '../components/Layout';
import AddActivityForm from '../components/AddActivityForm';

export default function AddActivityPage() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Add Transportation Activity</h1>
      <AddActivityForm />
    </Layout>
  );
}
