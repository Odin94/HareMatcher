package chat

import io.ktor.application.*
import io.ktor.http.cio.websocket.*
import io.ktor.routing.*
import io.ktor.websocket.*


fun Route.chatRouting() {
    webSocket("/chat") {
        send("You are connected!")
        for (frame in incoming) {
            frame as? Frame.Text ?: continue
            val receivedText = frame.readText()
            send("You said: $receivedText")
        }
    }
}

fun Application.registerChatRouting() {
    routing {
        chatRouting()
    }
}