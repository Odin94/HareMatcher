package de.odinmatthias

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction
import users.Users
import java.nio.file.Paths
import java.sql.Connection


class DatabaseConnector {
    init {
        connect()
        createSchema()

        transaction {
            addLogger(StdOutSqlLogger)

            Users.deleteAll()
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
            SchemaUtils.create(Users)
        }
    }

    suspend fun <T> dbQuery(block: () -> T): T = transaction { block() }
}