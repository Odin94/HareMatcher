package de.odinmatthias

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction
import org.mindrot.jbcrypt.BCrypt
import org.slf4j.LoggerFactory
import users.UserDAO
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

            transaction {
                val testEmail = "test@test.de"
                val user = UserDAO.find { Users.email eq testEmail }.firstOrNull()

                if (user == null) {
                    UserDAO.new {
                        this.name = "testUser"
                        this.email = testEmail
                        this.hashedPassword = BCrypt.hashpw("test", BCrypt.gensalt()).toByteArray()
                    }

                    val users = Users.selectAll().map { it[Users.email] }
                    logger.info("users: ${users.joinToString()}")
                }
            }

            alreadyInitiated = true
        }
    }

    private fun connect() {
        val projectPath = Paths.get("").toAbsolutePath().toString()

        val config = HikariConfig().apply {
            jdbcUrl = "jdbc:sqlite:${projectPath}/database/db.sqlite"
            driverClassName = "org.sqlite.JDBC"
            maximumPoolSize = 10
        }
        val dataSource = HikariDataSource(config)

        Database.connect(dataSource)
        TransactionManager.manager.defaultIsolationLevel = Connection.TRANSACTION_SERIALIZABLE
    }

    private fun createSchema() {
        transaction {
//            SchemaUtils.create(Users)
        }
    }

    suspend fun <T> dbQuery(block: () -> T): T = transaction { block() }
}