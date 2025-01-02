<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-left">
        <h1>Sign In to<br>Open the World</h1>
        <p>
          If you don't have an account,<br>
          you can <a href="#" class="register-link" @click.prevent="router.push('/register')">Register here</a>.
        </p>
      </div>

      <div class="login-form">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <input type="text" v-model="username" placeholder="Your username" class="form-input">
          </div>

          <div class="form-group">
            <input type="password" v-model="password" placeholder="Password" class="form-input">
            <div class="recovery-link">
              <a href="#">Recovery password</a>
            </div>
          </div>

          <button type="submit" class="sign-in-btn">Sign In</button>

          <div class="continue-with">
            <span>or continue with</span>
          </div>

          <div class="social-login">
            <button class="social-btn google">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
            </button>
            <button class="social-btn apple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M17.05,11.97 C17.0382,9.71896 18.8131,8.30138 18.8831,8.24738 C17.6831,6.54738 15.8131,6.32738 15.1431,6.30738 C13.6431,6.14738 12.1931,7.21738 11.4231,7.21738 C10.6531,7.21738 9.44307,6.32738 8.17307,6.34738 C6.49307,6.36738 4.93307,7.32738 4.09307,8.85738 C2.33307,11.9774 3.63307,16.6074 5.32307,19.1174 C6.16307,20.3474 7.15307,21.7174 8.47307,21.6774 C9.75307,21.6374 10.2431,20.8774 11.7731,20.8774 C13.3031,20.8774 13.7531,21.6774 15.0931,21.6574 C16.4731,21.6374 17.3331,20.4274 18.1531,19.1874 C19.1531,17.7574 19.5731,16.3674 19.5931,16.3074 C19.5531,16.2874 17.0731,15.3374 17.0531,11.9674" />
              </svg>
            </button>
            <button class="social-btn facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M20.9,2H3.1C2.5,2,2,2.5,2,3.1v17.8C2,21.5,2.5,22,3.1,22h9.6v-7.7h-2.6v-3h2.6V9.2c0-2.6,1.6-4,3.9-4c1.1,0,2.1,0.1,2.3,0.1v2.7h-1.6c-1.3,0-1.5,0.6-1.5,1.5v1.9h3l-0.4,3h-2.6V22h5.1c0.6,0,1.1-0.5,1.1-1.1V3.1C22,2.5,21.5,2,20.9,2z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    const res = await axios.post('https://rayqahnrrwmp.sealoshzh.site/login', {
      username: username.value,
      password: password.value
    })

    if (res.status === 200) {
      router.push('/home')
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } else {
      alert('用户名或密码错误')
    }

  } catch (error) {
    alert('用户名或密码错误')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(240, 240, 255, 1) 100%);
}

.login-content {
  display: flex;
  gap: 100px;
  padding: 40px;
  max-width: 1200px;
  width: 100%;
}

.login-left {
  flex: 1;
}

.login-left h1 {
  font-size: 48px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-form {
  flex: 1;
  max-width: 400px;
}

.form-group {
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
  padding: 15px;
  border: none;
  background: #f8f9ff;
  border-radius: 8px;
  font-size: 16px;
}

.recovery-link {
  text-align: right;
  margin-top: 8px;
}

.recovery-link a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
}

.sign-in-btn {
  width: 100%;
  padding: 15px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
}

.continue-with {
  text-align: center;
  margin: 20px 0;
  color: #666;
  position: relative;
}

.continue-with::before,
.continue-with::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #ddd;
}

.continue-with::before {
  left: 0;
}

.continue-with::after {
  right: 0;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.social-btn {
  width: 50px;
  height: 50px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-btn svg {
  width: 24px;
  height: 24px;
}

.google svg {
  fill: #DB4437;
}

.apple svg {
  fill: #000000;
}

.facebook svg {
  fill: #4267B2;
}

.register-link {
  color: #4f46e5;
  text-decoration: none;
}
</style>
