<template>
  <div>
    <h1>General Notes</h1>
    <li>All times are sent in STRING format.</li>
    <li>All messages.text properties are encrypted/decrypted on client.</li>
    <li>All passwords are stored/sent in hashed form.</li>
    <li>
      On your sent messages, one check means it was sent successfully to the
      chat, 2 means it was read recieved by the person, green means it was read
      by the person.
    </li>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
};
</script>
<style scoped></style>
