<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Navbar -->
    <header
      class="w-full border-b bg-white p-4 flex justify-between items-center max-w-7xl mx-auto"
    >
      <div class="font-bold text-xl tracking-tight text-slate-900">
        QR Lost & Found
      </div>
      <RouterLink to="/login">
        <Button variant="outline">Log in</Button>
      </RouterLink>
    </header>

    <!-- Main Content -->
    <main class="flex-grow flex flex-col items-center pt-20 px-4 pb-24">
      <!-- Hero Section -->
      <div class="max-w-3xl text-center space-y-6 mb-20">
        <h1 class="text-5xl font-extrabold tracking-tight text-slate-900">
          Never Lose Your Valuables Again.
        </h1>
        <p class="text-xl text-slate-600 max-w-2xl mx-auto">
          Generate secure QR codes for your keys, bags, and pets. If someone
          finds your item, they scan it, and you get an instant GPS
          notification.
        </p>

        <!-- Trust Badge -->
        <p
          class="text-sm font-semibold text-emerald-600 bg-emerald-50 inline-block px-4 py-1 rounded-full"
        >
          ✓ No app required for finders. Your personal details stay 100%
          private.
        </p>

        <div class="flex justify-center gap-4 pt-4">
          <RouterLink to="/login">
            <Button size="lg" class="text-lg px-8">Create Free QR Code</Button>
          </RouterLink>
        </div>
      </div>

      <!-- How It Works Section -->
      <div class="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>1. Generate</CardTitle>
            <CardDescription
              >Create a unique QR code in seconds.</CardDescription
            >
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Stick It</CardTitle>
            <CardDescription
              >Print or order stickers for your items.</CardDescription
            >
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Get Notified</CardTitle>
            <CardDescription
              >Receive an email with GPS coordinates when
              found.</CardDescription
            >
          </CardHeader>
        </Card>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 py-8 text-center text-sm">
      <div
        class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-4"
      >
        <p>&copy; 2026 QR Lost & Found. All rights reserved.</p>
        <div class="space-x-4 mt-4 md:mt-0">
          <a href="#" class="hover:text-white transition-colors"
            >Privacy Policy</a
          >
          <a href="#" class="hover:text-white transition-colors"
            >Terms of Service</a
          >
          <a
            href="mailto:support@yourdomain.com"
            class="hover:text-white transition-colors"
            >Contact</a
          >
        </div>
      </div>
    </footer>
  </div>
</template>
