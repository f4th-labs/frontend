import { createRouter, createWebHistory } from 'vue-router'
import HomeComponent from '@/components/views/Home.vue'
import EditComponent from '@/components/posts/EditPost.vue'
import CreateComponent from '@/components/posts/CreatePost.vue'
import PostComponent from '@/components/posts/Post.vue'
import LoginComponent from '@/components/login/Login.vue'
import RegisterComponent from '@/components/login/Register.vue'
import SearchResults from '@/components/search/SearchResults.vue'

const routes = [
  { path: '/', redirect: { name: 'home' } },
  { path: '/home', name: 'home', component: HomeComponent },
  { path: '/create', name: 'Create', component: CreateComponent },
  { path: '/edit/:id', name: 'Edit', component: EditComponent },
  { path: '/post/:id', name: 'Post', component: PostComponent, meta: { requiresAuth: true } },
  {
    path: '/login',
    name: 'Login',
    component: LoginComponent,
    props: (route) => ({ redirect: route.query.redirect, message: route.query.message }),
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterComponent,
    props: (route) => ({
      redirect: route.query.redirect,
    }),
  },
  { path: '/search', name: 'Search', component: SearchResults },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const userStr = localStorage.getItem('user')
    const isLoggedIn = !!userStr

    if (!isLoggedIn) {
      next({
        name: 'Login',
        query: {
          redirect: to.fullPath,
          message: 'Please log in to view full articles',
        },
      })
    } else {
      next()
    }
  } else {
    next()
  }

  if (to.name === 'CreatePost') {
    localStorage.setItem('resetCreatePostForm', 'true')
  }
  next()
})

export default router
