import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local manually
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyAll() {
  console.log('Verifying integrations...\n');
  let allGood = true;

  // 1. Verify Supabase
  console.log('--- Checking Supabase ---');
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase credentials');
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    // Try to just get the count of the audits table
    const { error } = await supabase.from('audits').select('*').limit(1);
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      allGood = false;
    } else {
      console.log('✅ Supabase connected successfully.');
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ Supabase verification error:', message);
    allGood = false;
  }

  // 2. Verify Groq
  console.log('\n--- Checking Groq API ---');
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Missing Groq API key');
    }
    const groq = new OpenAI({ 
      apiKey: process.env.GROQ_API_KEY, 
      baseURL: 'https://api.groq.com/openai/v1' 
    });
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say "Hello, World" and nothing else.' }],
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      max_tokens: 10,
    });
    console.log('✅ Groq connected successfully. Response:', completion.choices[0]?.message?.content);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ Groq connection failed:', message);
    allGood = false;
  }

  // 3. Verify Resend
  console.log('\n--- Checking Resend API ---');
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Missing Resend API key');
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    // Since we don't want to actually send an email, we can try to fetch domains to verify the key
    const domains = await resend.domains.list();
    if (domains.error) {
       console.error('❌ Resend key is invalid or lacks permissions:', domains.error.message);
       allGood = false;
    } else {
       console.log('✅ Resend key is valid. Found', domains.data?.length || 0, 'domains.');
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ Resend verification error:', message);
    allGood = false;
  }

  console.log('\n================================');
  if (allGood) {
    console.log('🎉 ALL INTEGRATIONS ARE WORKING!');
  } else {
    console.log('⚠️ SOME INTEGRATIONS FAILED. Please check the logs above.');
  }
}

verifyAll();
