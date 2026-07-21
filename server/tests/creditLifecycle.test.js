const assert=require('assert');const test=require('node:test');const r=require('../domain/creditLifecycle');
test('calculates conservative quantity in tCO2e',()=>assert.equal(r.conservativeQuantity({grossReductions:100,leakage:5,uncertaintyDeduction:10,permanenceBuffer:15}),70));
test('rejects deductions above gross',()=>assert.throws(()=>r.conservativeQuantity({grossReductions:10,leakage:8,uncertaintyDeduction:4,permanenceBuffer:0}),/exceed/));
test('enforces verifier independence',()=>assert.throws(()=>r.validateTransition('calculation_submitted','verification',{role:'verifier'},{verifierOrganizationId:'A',projectDeveloperOrganizationId:'A',conflictCheckId:'C'}),/independent/));
test('retirement requires beneficiary and receipt',()=>assert.throws(()=>r.validateTransition('issued','retired',{role:'registry_operator'},{quantity:1}),/Retirement/));
