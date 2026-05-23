package com.example.kmm_expenses

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform