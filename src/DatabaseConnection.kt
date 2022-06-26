package de.odinmatthias

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import de.odinmatthias.matches.ChatMessages
import de.odinmatthias.matches.Swipes
import de.odinmatthias.profiles.ProfilePictures
import de.odinmatthias.profiles.Profiles
import de.odinmatthias.profiles.Vaccinations
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory
import users.Users
import java.nio.file.Paths
import java.sql.Connection


class DatabaseConnector {
    private val logger = LoggerFactory.getLogger(javaClass)

    companion object {
        var alreadyInitiated = false
    }

    init {
        if (!alreadyInitiated) {
            connect()
            createSchema()

            transaction {
                addLogger(StdOutSqlLogger)
            }

            alreadyInitiated = true
        }
    }

    private fun connect() {
        val projectPath = Paths.get("").toAbsolutePath().toString()

        val config = HikariConfig().apply {
            jdbcUrl = "jdbc:sqlite:${projectPath}/database/db.sqlite"
            driverClassName = "org.sqlite.JDBC"
            maximumPoolSize = 1
        }
        val dataSource = HikariDataSource(config)

        Database.connect(dataSource)
        TransactionManager.manager.defaultIsolationLevel = Connection.TRANSACTION_SERIALIZABLE
    }

    private fun createSchema() {
        transaction {
            SchemaUtils.create(Users)
            SchemaUtils.create(Profiles)
            SchemaUtils.create(Vaccinations)
            SchemaUtils.create(ProfilePictures)
            SchemaUtils.create(Swipes)
            SchemaUtils.create(ChatMessages)
        }
    }

    suspend fun <T> dbQuery(block: () -> T): T = transaction { block() }
}