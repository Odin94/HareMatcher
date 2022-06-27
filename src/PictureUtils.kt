package de.odinmatthias

import java.io.ByteArrayInputStream
import java.net.URLConnection
import java.util.*


object PictureUtils {
    fun base64Encode(bytes: ByteArray, format: PictureFormat): String {
        if (format == PictureFormat.UNKNOWN) {
            return Base64.getEncoder().encodeToString(bytes)
        }

        return "data:image/${format};base64,${Base64.getEncoder().encodeToString(bytes)}"
    }

    fun guessFormat(pictureBytes: ByteArray): PictureFormat {
        val guessedFormat = URLConnection.guessContentTypeFromStream(ByteArrayInputStream(pictureBytes))

        return when (guessedFormat) {
            "image/png" -> PictureFormat.PNG
            "image/jpeg" -> PictureFormat.JPG
            "application/xml" -> PictureFormat.SVG
            "image/gif" -> PictureFormat.GIF
            "image/x-bitmap" -> PictureFormat.BMP
            else -> PictureFormat.UNKNOWN
        }
    }
}

enum class PictureFormat(val dataUrlFormat: String) {
    PNG("png"),
    JPG("jpg"),
    SVG("svg+xml"),
    GIF("gif"),
    BMP("bmp"),
    UNKNOWN("unknown");

    override fun toString() = dataUrlFormat
}
