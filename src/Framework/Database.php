<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\Framework;

use PDO;

class Database
{
    private ?PDO $pdo = null;

    public function __construct(private string $sqlserver,
                                private string $host,
                                private string $name,
                                private string $user,
                                private string $password,
                                private string $port)
    {
    }

    public function getConnection(): PDO
    {
        if ($this->pdo === null) {

            $dsn = "$this->sqlserver:host={$this->host};dbname={$this->name};charset=utf8;port=$this->port";

            $this->pdo = new PDO($dsn, $this->user, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
        }

        return $this->pdo;
    }
}