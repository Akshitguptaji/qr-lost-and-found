<script setup lang="ts">
//telling the vue we r using modern composition-api.
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../../lib/auth.js";
//Reactive variables that will directly connect to what the user types in the input boxes.
// const name = ref(''), email, password
const router = useRouter();
const email = ref(""); //ref stands for "reference," and it makes a variable reactive
const password = ref("");
const name = ref(""); //all thses are access by v-model in the input boxes. So when the user types in the input box, the value of these reactive variables will change accordingly.
const errorMessage = ref(" ");
const isloading = ref(false);
//Tracks if the API request is currently running so we can disable the button and prevent double-clicks.
//suppose a user click the btn (login or signup) and the request is sent to the backend, we want to show a loading spinner. So we create a reactive variable called isloading. When the request is sent, we set isloading to true. When the request is done, we set isloading to false.
const isSignUp = ref(false); //A reactive boolean. If false, show Login. If true, show Sign Up.

const handleSubmit = async () => {
  isloading.value = true; //Turns on the loading state and clears out any old errors from previous attempts.
  errorMessage.value = " ";
  let response; //it holds the result from the backend. It can be either a success or an error.

  if (isSignUp.value) {
    response = await auth.signUp.email({
      name: name.value,
      email: email.value,
      password: password.value,
    });
  } else {
    response = await auth.signIn.email({
      email: email.value,
      password: password.value,
    });
  }

  if (response.error) {
    errorMessage.value = response.error.message || "An error occurred";
  } else {
    router.push("/dashboard");
  }
  isloading.value = false;
};
</script>
//. If true, it prints the first string. If false, it prints the second.

<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
    <div
      class="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-zinc-200"
    >
      <h2 class="text-2xl font-bold text-center text-zinc-900 mb-6">
        {{ isSignUp ? "Create an Account" : "Log In" }}
      </h2>
      <!--
      /** Listens for the form submission. The .prevent stops the browser's */
      default behavior of reloading the entire page when a form is submitted.
    -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="isSignUp">
          <label class="block text-sm font-medium text-zinc-700 mb-1" for="name"
            >Name</label
          >
          <!--

          <//It visually tells the user what they should type into the blank box
          below it. If a user clicks on the word "Name" (the label), their
          cursor automatically jumps into the input box. It is a standard web
          practice. // :required="isSignUp"The colon : makes the HTML attribute
          dynamic. The name field is only required if the user is currently on
          the sign-up view. //If isSignUp is true, Vue slaps the required rule
          onto the input. If isSignUp is false (they are just logging in), Vue
          completely removes the required rule so the user can proceed. //This
          is called Two-Way Binding. The variable in your code and the physical
          box on the screen are chained together>
        -->
          <input
            id="name"
            v-model="name"
            type="text"
            :required="isSignUp"
            class="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label
            class="block text-sm font-medium text-zinc-700 mb-1"
            for="email"
            >Email</label
          >
          <!--
          //Two-way data binding.:- v-model="email"connects the input directly
          to your email ref.
          -->
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label
            class="block text-sm font-medium text-zinc-700 mb-1"
            for="password"
            >Password</label
          >
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm text-center"></p>
        <button
          type="submit"
          :disabled="isloading"
          class="w-full bg-zinc-900 text-white py-2 rounded-md hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          {{ isloading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In" }}
        </button>
      </form>
      <div class="mt-4 text-center">
        <button
          @click="isSignUp = !isSignUp"
          type="button"
          class="text-sm text-zinc-600 hover:text-black underline"
        >
          {{
            isSignUp
              ? "Already have an account? Log in"
              : "Need an account? Sign up"
          }}
        </button>
      </div>
    </div>
  </div>
</template>
